import { decode, encode } from '@msgpack/msgpack';
import type { SecureHttpContext } from './Contexts';
import { db } from './db';
import { getDictionary } from './getDictionary';
import * as clickhouse from '@clickhouse/client';
import * as nats from 'nats';
import {
	stringifyBON,
	type TsonHandlerModel,
	type Validator,
} from 'from-schema';
import { natsPort } from './env';
import { Err } from '@lyku/helpers';
import { Client } from '@elastic/elasticsearch';
import { createClickhouseClient } from './createClickhouseClient';
import { createRedisClient } from '@lyku/redis-client';
const port = process.env['PORT'] ? parseInt(process.env['PORT']) : 3000;
const methodsWithBody = ['POST', 'PUT', 'PATCH'];

const elastic = new Client({
	node: process.env['ELASTIC_API_ENDPOINT'],
	auth: {
		apiKey: process.env['ELASTIC_API_KEY'] as string,
	},
});

const c = createClickhouseClient();

const r = createRedisClient();

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
			// console.log('--- New request ---');
			const responseHeaders = new Headers();
			const origin = req.headers.get('origin');
			let allow;
			if (
				origin &&
				(origin.startsWith('https://lyku.org') ||
					/^https?:\/\/(192\.168\.|localhost(:|$))/.test(origin))
			) {
				allow = origin;
			} else {
				allow = 'https://lyku.org';
			}
			responseHeaders.set('Access-Control-Allow-Origin', allow);
			// console.log('Source origin:  ', origin);
			// console.log('Allowing origin:', allow);
			// responseHeaders.set('Access-Control-Allow-Origin', 'https://lyku.org');
			responseHeaders.set('Content-Type', 'application/x-msgpack');
			responseHeaders.set(
				'Access-Control-Allow-Methods',
				'GET, POST, PUT, DELETE, PATCH, OPTIONS',
			);
			responseHeaders.set(
				'Access-Control-Allow-Headers',
				'Content-Type, Authorization',
			);
			responseHeaders.set('Access-Control-Allow-Credentials', 'true');
			if (req.method === 'OPTIONS') {
				return new Response(null, {
					status: 204,
					headers: responseHeaders,
				});
			}

			const needsAuth = model.authenticated;
			// HTTP handler
			if (req.url.endsWith('/health')) {
				// console.log('Health check');
				return new Response(':D', { status: 200, headers: responseHeaders });
			}
			console.log('req', req.url);

			const auth = req.headers.get('authorization');
			const cookie = req.headers.get('cookie');
			const cookieSessionId = cookie
				?.split(';')
				.find((c) => c.trim().startsWith('sessionId='))
				?.split('=')[1];

			if (needsAuth && !auth && !cookieSessionId)
				return new Response('Unauthorized', {
					status: 401,
					headers: responseHeaders,
				});

			const sessionId = auth?.substring(7) || cookieSessionId;
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
				('method' in model &&
					methodsWithBody.includes(model.method.toLocaleUpperCase())) ||
				'request' in model;
			// Parse params from MessagePack
			const arrayBuffer = methodHasBody ? await req.arrayBuffer() : undefined;
			const intArray = arrayBuffer ? new Uint8Array(arrayBuffer) : undefined;
			const params = intArray?.length
				? decode(intArray, { useBigInt64: true })
				: undefined;
			if ('request' in model && methodHasBody) {
				try {
					validator.validate(params);
				} catch (e) {
					return new Response(
						`Request "${stringifyBON(params)}" failed validation ${stringifyBON(
							model.request,
						)} due to ${e}`,
						{ status: 400, headers: responseHeaders },
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
					elastic,
					clickhouse: c,
					redis: r,
					now: new Date(),
				})) as SecureHttpContext<any>;
				const pack = encode(output, { useBigInt64: true });

				return new Response(pack, {
					headers: responseHeaders,
				});
			} catch (e) {
				console.error(
					e instanceof Err ? e.code : 'unknown',
					'error executing route',
					e,
				);
				if (e instanceof Err) {
					return new Response(e.message, {
						status: e.code,
						headers: responseHeaders,
					});
				}
				return new Response('Internal server error', {
					status: 500,
					headers: responseHeaders,
				});
			}
		},
	});
	console.log(
		'HTTP server started on port',
		port,
		'for',
		process.env['HOSTNAME'],
	);
};
