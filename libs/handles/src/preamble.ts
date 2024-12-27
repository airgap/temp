const { serve } = Bun;
import { Database } from '@lyku/db-config/kysely'; // this is the Database interface we defined earlier
import { Pool } from 'pg';
import { Kysely, PostgresDialect } from 'kysely';
import { CompactedPhrasebook, getPhrasebook } from '@lyku/phrasebooks';
import { Server as HttpServer, IncomingMessage, ServerResponse } from 'http';
import { Server as HttpsServer } from 'https';
import { WebSocket } from 'ws';
import { decode, encode } from '@msgpack/msgpack'; // Import the MessagePack decoder
import { en_US } from '@lyku/strings';

type ContextBase = {
	db: Kysely<Database>;
	isSecure?: boolean;
	httpServer?: HttpServer | HttpsServer;
	strings: CompactedPhrasebook;
	message: typeof Bun.Request;
	response: typeof Bun.Response;
};
export type GuestContext = ContextBase & {
	requester?: bigint;
	session?: string;
};
export type SecureContext = ContextBase & {
	requester: bigint;
	session: string;
};
type SocketBase = { socket: WebSocket; emit: (data: unknown) => void };
export type GuestSocketContext = GuestContext & SocketBase;
export type SecureSocketContext = SecureContext & SocketBase;
const dialect = new PostgresDialect({
	pool: new Pool({
		database: 'Lyku',
		host: 'localhost',
		user: 'admin',
		port: 5434,
		max: 10,
	}),
});

// Database interface is passed to Kysely's constructor, and from now on, Kysely
// knows your database structure.
// Dialect is passed to Kysely's constructor, and from now on, Kysely knows how
// to communicate with your database.
export const db = new Kysely<Database>({
	dialect,
});

export function getCookie(cookies: string, cname: string) {
	const name = cname + '=';
	const ca = cookies.split(';');
	for (const element of ca) {
		let c = element;
		while (c.charAt(0) === ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) === 0) {
			return c.substring(name.length, c.length);
		}
	}
	return '';
}

export const getDictionary = (msg: IncomingMessage): CompactedPhrasebook => {
	let lang = getCookie(msg.headers.cookie ?? '', 'lang');
	let dictionary;
	if (lang) dictionary = getPhrasebook(lang);
	else {
		const acceptableLanguages =
			msg.headers['accept-language'] ??
			''.replace(/;q=[0-9.]{1,3}/g, '').split(/, /g);
		for (lang of acceptableLanguages) {
			dictionary = getPhrasebook(lang);
			if (dictionary) break;
		}
	}
	if (!dictionary) dictionary = en_US;
	return dictionary;
};

const port = process.env['PORT'] ? parseInt(process.env['PORT']) : 3000;

export const serveHttp = ({
	execute,
	validate,
}: {
	execute: (params: unknown, context: GuestContext) => unknown;
	validate: (params: unknown) => boolean;
}) =>
	serve({
		port,
		async fetch(req) {
			// HTTP handler
			const auth = req.headers.get('authorization');
			if (!auth) return new Response('Unauthorized', { status: 401 });

			const sessionId = auth.substring(7);
			if (!sessionId) return new Response('Invalid sessionId', { status: 403 });

			const session = await db
				.selectFrom('sessions')
				.select('userId')
				.where('id', '=', sessionId)
				.executeTakeFirst();

			// Parse params from MessagePack
			const arrayBuffer = await req.arrayBuffer();
			const params = decode(new Uint8Array(arrayBuffer));
			try {
				validate(params);
			} catch (e) {
				return new Response('Invalid request', { status: 400 });
			}
			const phrasebook = getDictionary(req);

			const output = await execute(params, {
				db,
				strings: phrasebook,
				message: req,
				requester: session?.userId,
				session: sessionId,
			});

			const pack = encode(output);

			// Route handling here
			const res = new Response(pack);
			res.headers.set('Access-Control-Allow-Origin', '*');
			res.headers.set(
				'Access-Control-Allow-Headers',
				'Authorization, Content-Type'
			);
			return res;
		},
	});

export const serveWebsocket = ({
	execute,
	validate,
}: {
	execute: (params: unknown, context: GuestSocketContext) => unknown;
	validate: (params: unknown) => boolean;
}) =>
	serve({
		port: 3000,
		websocket: {
			open(ws) {
				// Connection established
				ws.data = { authenticated: false }; // Initialize connection data
			},
			async message(ws, message) {
				// Decode the incoming MessagePack message
				const decodedMessage = decode(new Uint8Array(message));

				// First message must be auth token
				if (!ws.data.authenticated) {
					if (
						typeof decodedMessage !== 'string' ||
						!decodedMessage.startsWith('Bearer ')
					) {
						ws.close(1008, 'Invalid token format');
						return;
					}

					const sessionId = decodedMessage.substring(7);
					if (!sessionId) {
						ws.close(1008, 'Invalid sessionId');
						return;
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

					ws.data.user = { id: session.userId, sessionId };
					ws.data.authenticated = true;
					// ws.send(encode("Authenticated"));
					return;
				}

				// Handle authenticated messages
				const context: SecureSocketContext = {
					db,
					strings: getDictionary(ws),
					message: ws,
					requester: ws.data.user.id,
					session: ws.data.user.sessionId,
					socket: ws,
					emit: (data: unknown) => ws.send(encode(data)),
				};

				// Validate the decoded params
				try {
					validate(decodedMessage);
				} catch (e) {
					ws.send(encode('Invalid request'));
					return;
				}

				await execute(decodedMessage, context);
			},
			close(ws) {
				// Cleanup
				console.log('Connection closed');
			},
		},
	});
