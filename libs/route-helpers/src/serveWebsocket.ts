import { decode } from '@msgpack/msgpack';
import { SecureSocketContext } from './Contexts';
import { encode } from '@msgpack/msgpack';
import { MaybeSecureSocketContext } from './Contexts';
import { db } from './db';
import { getDictionary } from './getDictionary';
import { ServerWebSocket } from 'bun';
import { TsonSchemaOrPrimitive } from 'from-schema';
import { WebSocketRoute } from 'from-schema';
import { en_US } from '@lyku/strings';
import * as nats from 'nats';

const port = process.env['PORT'] ? parseInt(process.env['PORT']) : 3000;
type Data = { authenticated: boolean; user?: bigint; sessionId?: string };
type Responder = ((params: any, context: MaybeSecureSocketContext) => any) | ((params: any, context: SecureSocketContext) => any)
export const serveWebsocket = async ({
	onOpen,
	onTweak,
	validate,
	model,
}: {
	onOpen: Responder;
	onTweak: Responder;
	validate: (params: unknown) => boolean;
	model: WebSocketRoute;
}) => {
	const nc = await nats.connect();
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
						: new Uint8Array(message)
				);

				// First message must be auth token
				if (!ws.data.authenticated) {
					if (
						typeof decodedMessage !== 'object' ||
						decodedMessage === null ||
						!('auth' in decodedMessage) ||
						typeof decodedMessage.auth !== 'string'
					) {
						ws.send(
							encode({
								authenticated: false,
								error: 'Invalid auth token',
							})
						);
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

					if ('request' in model) {
						if (
							'request' in decodedMessage &&
							!validate(decodedMessage.request)
						) {
							ws.send(
								encode({
									authenticated: false,
									error: 'Invalid request',
								})
							);
							return;
						}
					} else {
						if ('request' in decodedMessage) {
							ws.send(
								encode({
									authenticated: false,
									error: 'Invalid request',
								})
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

					onOpen?.('request' in decodedMessage ? decodedMessage.request : {}, {
						db,
						strings: en_US,
						requester: ws.data.user,
						session: ws.data.sessionId,
						socket: ws,
						emit: (data: unknown) => ws.send(encode(data)),
						nats: nc,
						server,
					});

					// ws.send(encode("Authenticated"));
					return;
				}
				if (!ws.data.user || !ws.data.sessionId) {
					ws.close(1008, 'Invalid session');
					return;
				}

				// Handle authenticated messages
				const context: SecureSocketContext = {
					db,
					strings: en_US,
					requester: ws.data.user,
					session: ws.data.sessionId,
					socket: ws,
					emit: (data: unknown) => ws.send(encode(data)),
					server,
					nats: nc,
				};

				// Validate the decoded params
				try {
					validate(decodedMessage);
				} catch (e) {
					ws.send(encode('Invalid request'));
					return;
				}

				await onTweak(decodedMessage, context);
			},
			close(ws) {
				// Cleanup
				console.log('Connection closed');
			},
		},
	});
};
