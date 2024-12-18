import { RequestListener } from 'http';
import { getDictionary } from './getDictionary';
import { addBasicHeaders } from './addBasicHeaders';
import { apiSplash } from './apiSplash';
import * as routes from './routes';
import { ender } from './ender';
import { getUserId } from './getUserId';
import { Kysely } from 'kysely';
import { Database } from '@lyku/db-config/kysely';
import { GuestContext } from '@lyku/handles';

export const httpListener =
	(db: Kysely<Database>): RequestListener =>
	(msg, res) => {
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader(
			'Access-Control-Allow-Headers',
			'Authorization, Content-Type',
		);
		// currentReqs.inc();
		// console.log(
		// 	'Received new request',
		// 	msg.url
		// 	// msg.headers,
		// 	// 'cookie',
		// 	// msg.headers.cookie
		// );

		const phrasebook = getDictionary(msg);

		const incoming: string[] = [];
		const end = ender(res, phrasebook);

		if (msg.method === 'OPTIONS') {
			// console.log('OPTIONS OPTIONS OPTIONS');
			res.writeHead(204, {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
				'Access-Control-Allow-Headers':
					'Authorization, Content-Type, tus-resumable, upload-length, Location, Allow-Headers, Origin, Accept',
			});
			res.end();
			return;
		}
		addBasicHeaders(res); //, state.isSecure);
		if (msg.method === 'GET')
			return end(apiSplash, 200, {
				'Content-Type': 'text/html; charset=utf-8',
			});

		if (!msg.url) return end('No route', 404);
		const path = msg.url.substring(1).split(/[/?]/)[0];
		console.log('Path', path);
		if (!(path in routes)) return end(phrasebook.invalidRoute, 404);
		const route = routes[path as keyof typeof routes];
		const sessionId = msg.headers.authorization?.substring(7);
		let userId: bigint;
		if ('authenticated' in route && route.authenticated && !sessionId)
			return end(phrasebook.notLoggedIn, 401);
		let ready = 0;
		if (sessionId)
			void getUserId(sessionId, db)
				.then((id) => {
					userId = id;
					maybeDoTheThing();
				})
				.catch((e: Error) => {
					console.log('getUserId failed:', e);
					end(e.message, parseInt(e.message));
					return false;
				});
		else ready++;
		console.log('sessionid', sessionId, 'ready', ready);
		if ('stream' in route) {
			return;
		}
		// console.log(
		// 	path,
		// 	'is in apis, sessionid',
		// 	msg.headers.Sessionid,
		// 	'all',
		// 	msg.headers
		// );
		const doTheThing = () => {
			console.log('Doing the thing');
			// console.log('Data received', msg.headers);
			const joined = incoming.join('');
			// console.log(path, 'joined', joined);
			// console.log(
			// 	path,
			// 	'schema',
			// 	'schema' in validate ? validate.schema : '[none]'
			// );
			const parsed = JSON.parse(joined || '{}');
			// const parameters = parse(msg.url ?? '', true).query;
			// // console.log(path, 'VALID?  ', valid);
			// if (!validateParameters(parameters))
			// 	return end('Invalid request parameters', 400);
			if (!('validate' in route && route.validate(parsed))) {
				return end('Invalid request body', 400);
			}
			if (!parsed) return end(phrasebook.invalidRequestJson, 404);
			// console.log('Responding');
			const r = route.respond(
				parsed as never,
				{
					message: msg,
					requester: userId,
					strings: phrasebook,
				} as GuestContext,
			);
			r?.then(end).catch((e) => {
				console.error('Route', path, 'threw', e.message);
				if (/^\d{3}$/.test(e.message))
					return end(e.message, parseInt(e.message));
				end(e.message, 500);
			});
			console.log('ended');
		};
		const maybeDoTheThing = () => ++ready === 2 && doTheThing();
		msg.on('data', (d) => {
			// console.log(path, 'pushing incoming', d);
			incoming.push(d);
		});
		msg.on('end', maybeDoTheThing);
	};
