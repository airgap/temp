import { decode } from '@msgpack/msgpack';
import { SecureSocketContext, TweakHandler } from './Contexts';
import { encode } from '@msgpack/msgpack';
import { MaybeSecureSocketContext } from './Contexts';
import { db } from './db';
import { getDictionary } from './getDictionary';
import { ServerWebSocket } from 'bun';
import {
	StreamConfig,
	TsonSchemaOrPrimitive,
	TsonStreamHandlerModel,
	Validator,
} from 'from-schema';
import { en_US } from '@lyku/strings';
import * as nats from 'nats';
import { natsPort } from './env';

const port = process.env['PORT'] ? parseInt(process.env['PORT']) : 3000;
type Data = { authenticated: boolean; user?: bigint; sessionId?: string };
export const serveWebsocket = async <Model extends TsonStreamHandlerModel>({
	onOpen,
	validator,
	tweakValidator,
	model,
}: {
	onOpen: any;
	validator: Validator;
	tweakValidator?: Model['stream'] extends StreamConfig ? Validator : never;
	model: Model;
}) => {
	const nc = await nats.connect({
		servers: [natsPort],
	});
	const closers: (() => void)[] = [];
	const tweakers: ((params: any) => void)[] = [];
	const server = Bun.serve({
		port,
		fetch(server, req) {
			req.upgrade(server);
		},
		websocket: {
			open(ws) {
				// Connection established
				ws.data = { authenticated: false }; // Initialize connection data
			},
			async message(ws: ServerWebSocket<Data>, message) {
				// Decode the incoming MessagePack message
				const decodedMessage = decode(
					typeof message === 'string'
						? JSON.parse(message)
						: new Uint8Array(message),
				);

				// First message must be auth token
				if (!ws.data.authenticated) {
					if (
						typeof decodedMessage !== 'object' ||
						decodedMessage === null ||
						!('auth' in decodedMessage) ||
						typeof decodedMessage.auth !== 'string'
					) {
						ws.close(1008, 'Invalid auth token');
						return;
					}
					if (
						typeof decodedMessage.auth !== 'string' ||
						!decodedMessage.auth.startsWith('Bearer ')
					) {
						ws.close(1008, 'Invalid token format');
						return;
					}

					const sessionId = decodedMessage.auth.substring(7);
					if (!sessionId) {
						ws.close(1008, 'Invalid sessionId');
						return;
					}
					const hasRequest = 'request' in model;
					let request;

					if (hasRequest) {
						if (!('request' in decodedMessage)) {
							ws.close(1008, 'Invalid request');
							return;
						}
						request = decodedMessage.request;
						if (!validator.isValid(request)) {
							ws.close(1008, 'Invalid request');
							return;
						}
					} else {
						if ('request' in decodedMessage) {
							ws.send(
								encode({
									authenticated: false,
									error: 'Invalid request',
								}),
							);
							return;
						}
					}

					const session = await db
						.selectFrom('sessions')
						.select('userId')
						.where('id', '=', sessionId)
						.executeTakeFirst();

					if (!session) {
						ws.close(1008, 'Invalid session');
						return;
					}

					ws.data.user = session.userId;
					ws.data.sessionId = sessionId;
					ws.data.authenticated = true;

					onOpen?.(request, {
						db,
						strings: en_US,
						requester: ws.data.user,
						session: ws.data.sessionId,
						socket: ws,
						emit: (data: any) => ws.send(encode(data)),
						nats: nc,
						server,
						onClose: (closer: () => void) => closers.push(closer),
						onTweak: (tweaker: any) => tweakers.push(tweaker),
						model,
					});

					// ws.send(encode("Authenticated"));
					return;
				}
				if (!ws.data.user || !ws.data.sessionId) {
					ws.close(1008, 'Invalid session');
					return;
				}

				if (!tweakValidator?.isValid(decodedMessage)) {
					ws.close(1008, 'Invalid request');
					return;
				}
				tweakers.forEach((tweaker) => tweaker(decodedMessage));
			},
			close(ws: ServerWebSocket<Data>) {
				closers.forEach((closer) => closer());
				// Cleanup
				console.log('Connection closed');
			},
		},
	});
};
