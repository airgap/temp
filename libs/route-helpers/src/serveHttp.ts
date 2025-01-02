import { decode, encode } from '@msgpack/msgpack';
import { MaybeSecureContext, MaybeSecureHttpContext } from './Contexts';
import { db } from './db';
import { getDictionary } from './getDictionary';

const port = process.env['PORT'] ? parseInt(process.env['PORT']) : 3000;

export const serveHttp = ({
	execute,
	validate,
}: {
	execute: (params: unknown, context: MaybeSecureHttpContext) => unknown;
	validate: (params: unknown) => boolean;
}) => {
	Bun.serve({
		port,
		async fetch(req) {
			// HTTP handler
			if (req.url.endsWith('/health')) {
				console.log('Health check');
				return new Response(':D', { status: 200 });
			}

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

			const responseHeaders = new Headers();
			responseHeaders.set('Access-Control-Allow-Origin', '*');
			const output = await execute(params, {
				db,
				strings: phrasebook,
				request: req,
				requester: session?.userId,
				session: sessionId,
				responseHeaders,
			});

			const pack = encode(output);

			// Route handling here
			const res = new Response(pack, {
				headers: responseHeaders,
			});
			return res;
		},
	});
	console.log(
		'HTTP server started on port',
		port,
		'for',
		process.env['SERVICE_NAME']
	);
};
