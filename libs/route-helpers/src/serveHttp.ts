// libs/route-helpers/src/serveHttp.ts
import { decode, encode } from '@msgpack/msgpack';
import type { SecureHttpContext } from './Contexts';
import { client as pg } from '@lyku/postgres-client';
import { getDictionary } from './getDictionary';
import {
	parsePossibleBON,
	stringifyBON,
	type TsonHandlerModel,
	type Validator,
} from 'from-schema';
import { Err } from '@lyku/helpers';
import { client as redis } from '@lyku/redis-client';
import { type Session } from '@lyku/json-models';
import { pack, unpack } from 'msgpackr';
import { MetricsCollector } from './metrics';

const port = process.env['PORT'] ? parseInt(process.env['PORT']) : 3000;
const methodsWithBody = ['POST', 'PUT', 'PATCH'];

// Global metrics collector - initialized when service starts
let metricsCollector: MetricsCollector | null = null;

export const serveHttp = async ({
	execute,
	validator,
	model,
}: {
	execute: (...args: any[]) => any;
	validator: Validator;
	model: TsonHandlerModel;
	serviceName?: string; // New optional parameter
}) => {
	console.log('Starting HTTP server');

	const serviceName = process.env['HOSTNAME']
		?.split('-')
		.slice(1, -2)
		.join('-');

	// Initialize metrics collector if serviceName provided
	if (serviceName) {
		metricsCollector = new MetricsCollector(serviceName);
		console.log(`Metrics enabled for service: ${serviceName}`);
	}

	const server = Bun.serve({
		idleTimeout: 120,
		port,
		async fetch(req) {
			// Handle metrics endpoint first (before any other processing)
			if (req.url.endsWith('/metrics') && metricsCollector) {
				return metricsCollector.getMetricsHandler()();
			}

			// Start tracking this request if metrics enabled
			const finishRequest = metricsCollector?.startRequest(req.url);

			console.log('New request ->', req.url);
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
				console.log('Returning OPTIONS');
				finishRequest?.(204); // Track OPTIONS requests
				return new Response(null, {
					status: 204,
					headers: responseHeaders,
				});
			}

			const needsAuth = model.authenticated;

			// HTTP handler
			if (req.url.endsWith('/health')) {
				console.log('Health check');
				finishRequest?.(200); // Track health checks
				return new Response(':D', { status: 200, headers: responseHeaders });
			}

			console.log('req', req.url);

			const auth = req.headers.get('authorization');
			const cookie = req.headers.get('cookie');
			const cookieSessionId = cookie
				?.split(';')
				.find((c) => c.trim().startsWith('sessionId='))
				?.split('=')[1];

			if (needsAuth && !auth && !cookieSessionId) {
				console.warn('Unauthorized', req.url);
				finishRequest?.(401);
				return new Response('Unauthorized', {
					status: 401,
					headers: responseHeaders,
				});
			}

			const sessionId = auth?.substring(7) || cookieSessionId;
			let session: { userId: bigint } | Session | null = null;
			if (needsAuth && !sessionId) {
				console.warn('SessionId required but not provided');
				finishRequest?.(403);
				return new Response('SessionId required but not provided', {
					status: 403,
					headers: responseHeaders,
				});
			}

			if (sessionId) {
				console.log('Getting session from redis');
				session = await redis
					.getBuffer(`session:${sessionId}`)
					.then((s) => s && unpack(s));
				console.log('Session from redis:', session?.userId);
				if (!session) {
					session =
						(await pg
							.selectFrom('sessions')
							.select('userId')
							.where('id', '=', sessionId)
							.executeTakeFirst()) ?? null;
					console.log('Session after pg call', session?.userId);
					if (session) await redis.set(`session:${sessionId}`, pack(session));
				}
			}

			if (needsAuth && !session) {
				console.log('Session required but null');
				finishRequest?.(403);
				return new Response('Invalid session', {
					status: 403,
					headers: responseHeaders,
				});
			}

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
					finishRequest?.(400);
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
				console.log('Executing route');
				const output = (await execute(params ?? {}, {
					strings: phrasebook,
					request: req,
					requester: session?.userId,
					session: sessionId,
					responseHeaders,
					server,
					model,
					now: new Date(),
				})) as SecureHttpContext<any>;
				const pack = encode(output, { useBigInt64: true });
				console.log('Route executed successfully');
				finishRequest?.(200); // Success
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
					finishRequest?.(e.code);
					return new Response(e.message, {
						status: e.code,
						headers: responseHeaders,
					});
				}
				finishRequest?.(500);
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
		metricsCollector ? 'with metrics enabled' : 'without metrics',
	);

	return server;
};
