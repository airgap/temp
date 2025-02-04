import { decode, encode } from '@msgpack/msgpack';
import type { SecureHttpContext } from './Contexts';
import { db } from './db';
import { getDictionary } from './getDictionary';
import * as nats from 'nats';
import {
	stringifyBON,
	type TsonHandlerModel,
	type Validator,
} from 'from-schema';
import { natsPort } from './env';

const port = process.env['PORT'] ? parseInt(process.env['PORT']) : 3000;
const methodsWithBody = ['POST', 'PUT', 'PATCH'];

export const serveHttp = async ({
	execute,
	validator,
	model,
}: {
	execute: (...args: any[]) => any;
	validator: Validator;
	model: TsonHandlerModel;
}) => {
	console.log('Connecting to NATS');
	const nc = await nats.connect({
		servers: [natsPort],
	});
	console.log('Connected to NATS');
	console.log('Starting HTTP server');
	const server = Bun.serve({
		port,
		async fetch(req) {
			const responseHeaders = new Headers();
			responseHeaders.set('Access-Control-Allow-Origin', '*');
			responseHeaders.set('Content-Type', 'application/x-msgpack');
			responseHeaders.set(
				'Access-Control-Allow-Methods',
				'GET, POST, PUT, DELETE, PATCH, OPTIONS'
			);
			responseHeaders.set(
				'Access-Control-Allow-Headers',
				'Content-Type, Authorization'
			);

			if (req.method === 'OPTIONS') {
				return new Response(null, {
					status: 204,
					headers: responseHeaders,
				});
			}

			const needsAuth = model.authenticated;
			// HTTP handler
			if (req.url.endsWith('/health')) {
				console.log('Health check');
				return new Response(':D', { status: 200, headers: responseHeaders });
			}
			console.log('req', req.url);

			const auth = req.headers.get('authorization');
			if (needsAuth && !auth)
				return new Response('Unauthorized', {
					status: 401,
					headers: responseHeaders,
				});

			const sessionId = auth?.substring(7);
			if (needsAuth && !sessionId)
				return new Response('SessionId required but not provided', {
					status: 403,
					headers: responseHeaders,
				});

			const session = sessionId
				? await db
						.selectFrom('sessions')
						.select('userId')
						.where('id', '=', sessionId)
						.executeTakeFirst()
				: null;

			if (needsAuth && !session)
				return new Response('Invalid session', {
					status: 403,
					headers: responseHeaders,
				});

			const methodHasBody =
				'method' in model && methodsWithBody.includes(model.method);
			// Parse params from MessagePack
			const arrayBuffer = methodHasBody ? await req.arrayBuffer() : undefined;
			console.log('arrayBuffer', arrayBuffer);
			const intArray = arrayBuffer ? new Uint8Array(arrayBuffer) : undefined;
			console.log('intArray', intArray);
			const params = intArray?.length ? decode(intArray) : undefined;
			console.log('params', params);
			if ('request' in model && methodHasBody) {
				try {
					validator.validate(params);
				} catch (e) {
					return new Response(
						`Request "${stringifyBON(params)}" failed validation ${stringifyBON(
							model.request
						)} due to ${e}`,
						{ status: 400, headers: responseHeaders }
					);
				}
			}
			const phrasebook = getDictionary(req);
			try {
				const output = (await execute(params ?? {}, {
					db,
					strings: phrasebook,
					request: req,
					requester: session?.userId, // oh just kill me
					session: sessionId,
					responseHeaders,
					nats: nc,
					server,
					model,
				})) as SecureHttpContext<any>;

				const pack = encode(output);

				// Route handling here

				return new Response(pack, {
					headers: responseHeaders,
				});
			} catch (e) {
				console.error('Error executing route', e);
				return new Response('Internal server error', { status: 500 });
			}
		},
	});
	console.log(
		'HTTP server started on port',
		port,
		'for',
		process.env['HOSTNAME']
	);
};
