import { decode, encode } from '@msgpack/msgpack';
import {
	MaybeSecureHttpContext,
	MaybeSecureSocketContext,
	SecureHttpContext,
	SecureSocketContext,
} from './Contexts';
import { db } from './db';
import { getDictionary } from './getDictionary';
import { TsonHandlerModel } from 'from-schema';
import * as nats from 'nats';
import { Validator } from 'from-schema';

const port = process.env['PORT'] ? parseInt(process.env['PORT']) : 3000;

export const serveHttp = async ({
	execute,
	validator,
	model,
}: {
	execute: (...args: any[]) => any;
	validator: Validator;
	model: TsonHandlerModel;
}) => {
	const nc = await nats.connect();
	const server = Bun.serve({
		port,
		async fetch(req) {
			const needsAuth = model.authenticated;
			// HTTP handler
			if (req.url.endsWith('/health')) {
				console.log('Health check');
				return new Response(':D', { status: 200 });
			}

			const auth = req.headers.get('authorization');
			if (needsAuth && !auth)
				return new Response('Unauthorized', { status: 401 });

			const sessionId = auth?.substring(7);
			if (!sessionId) return new Response('Invalid sessionId', { status: 403 });

			const session = sessionId
				? await db
						.selectFrom('sessions')
						.select('userId')
						.where('id', '=', sessionId)
						.executeTakeFirst()
				: null;

			if (needsAuth && !session)
				return new Response('Invalid session', { status: 403 });

			// Parse params from MessagePack
			const arrayBuffer = await req.arrayBuffer();
			const params = decode(new Uint8Array(arrayBuffer));
			try {
				validator.validate(params);
			} catch (e) {
				return new Response('Invalid request', { status: 400 });
			}
			const phrasebook = getDictionary(req);

			const responseHeaders = new Headers();
			responseHeaders.set('Access-Control-Allow-Origin', '*');
			const output = (await execute(params, {
				db,
				strings: phrasebook,
				request: req,
				requester: session!.userId, // oh just kill me
				session: sessionId,
				responseHeaders,
				nats: nc,
				server,
				model,
			})) as any;

			const pack = encode(output);

			// Route handling here

			return new Response(pack, {
				headers: responseHeaders,
			});
		},
	});
	console.log(
		'HTTP server started on port',
		port,
		'for',
		process.env['SERVICE_NAME']
	);
};
