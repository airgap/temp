import { pack, unpack } from 'msgpackr';
import { db } from './db';
import type { ServerWebSocket } from 'bun';
import * as redis from 'redis';
import {
	type StreamConfig,
	type TsonStreamHandlerModel,
	type Validator,
} from 'from-schema';
import { en_US } from '@lyku/strings';
import { createRedisClient } from '@lyku/redis-client';

const r = createRedisClient();

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
	const closers: (() => void)[] = [];
	const tweakers: ((params: any) => void)[] = [];
	const server = Bun.serve({
		port,
		fetch(req, server) {
			const { pathname } = new URL(req.url);
			// console.log('Got fetch', req.url, server.url);
			const fixed = {
				'/health': new Response(':D'),
				'/liveliness': new Response('>8D'),
			};
			if (pathname in fixed) {
				console.log('Static', pathname);
				return fixed[pathname as keyof typeof fixed];
			}
			console.log('Upgrading');
			server.upgrade(req);
			console.log('Upgraded');
			return new Response();
		},
		websocket: {
			open(ws) {
				console.log('Websocket opened');
				// Connection established
				ws.data = { authenticated: false }; // Initialize connection data
			},
			async message(ws: ServerWebSocket<Data>, message) {
				console.log('Decoding message', typeof message, message);
				// Decode the incoming MessagePack message
				const decodedMessage = unpack(
					typeof message === 'string'
						? Uint8Array.from(message)
						: new Uint8Array(message),
				);
				console.log('Decoded message');

				// First message must have auth token
				if (!ws.data.authenticated) {
					console.log('Authenticating', (decodedMessage as any).auth);
					if (
						typeof decodedMessage !== 'object' ||
						decodedMessage === null ||
						!('auth' in decodedMessage) ||
						typeof decodedMessage.auth !== 'string'
					) {
						console.log('Invalid auth token');
						ws.close(1008, 'Invalid auth token');
						return;
					}
					if (
						typeof decodedMessage.auth !== 'string' ||
						!decodedMessage.auth.startsWith('Bearer ')
					) {
						console.log('Invalid token format');
						ws.close(1008, 'Invalid token format');
						return;
					}
					console.log('Auth valid', decodedMessage.auth);

					const sessionId = decodedMessage.auth.substring(7);
					if (!sessionId) {
						ws.close(1008, '[WS] Invalid sessionId');
						return;
					}
					console.log('Session ID:', sessionId);
					const hasRequest = 'request' in model;
					let request;

					if (hasRequest) {
						if (!('request' in decodedMessage)) {
							console.warn(
								'hasRequest',
								hasRequest,
								'request in model',
								'request' in model,
							);
							ws.close(1008, 'Invalid request');
							return;
						}
						request = decodedMessage.request;
						if (!validator.isValid(request)) {
							ws.close(1008, 'Invalid request');
							return;
						}
					} else {
						// if ('request' in decodedMessage) {
						// 	const packed = pack({
						// 		authenticated: false,
						// 		error: 'Invalid request',
						// 	});
						// 	ws.send(new Uint8Array(packed));
						// 	return;
						// }
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
						strings: en_US,
						requester: ws.data.user,
						session: ws.data.sessionId,
						socket: ws,
						emit: (data: any) => {
							const packed = pack(data);
							ws.send(new Uint8Array(packed));
						},
						server,
						onClose: (closer: () => void) => closers.push(closer),
						onTweak: (tweaker: any) => tweakers.push(tweaker),
						model,
						now: new Date(),
					});
					console.log('Returning');
					const authPacked = pack({ authenticated: true });
					ws.send(new Uint8Array(authPacked));
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
