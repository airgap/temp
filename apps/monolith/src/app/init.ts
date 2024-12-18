import { servicePort } from './env';
import { Server as HttpServer } from 'http';
import * as routes from './routes';
// import { state } from './state';
import { Pool } from 'pg';
const dbName = 'lyku';
import { httpListener } from './httpListener';
import { webSocketServer, handleConnection } from './webSocketServer';
export const init = async () => {
	console.log('Initializing database connection');

	// First connect to postgres to create database if needed
	const rootPool = new Pool({
		database: 'postgres',
	});

	try {
		const dbExists = await rootPool.query(
			`SELECT 1 FROM pg_database WHERE datname = $1`,
			[dbName],
		);

		if (dbExists.rows.length === 0) {
			console.log('Creating database', dbName);
			await rootPool.query(`CREATE DATABASE ${dbName}`);
		}
	} finally {
		await rootPool.end();
	}

	// Now connect to our database
	const { Kysely } = require('kysely');
	const { Pool: DbPool } = require('pg');
	const { PostgresDialect } = require('kysely-postgres');

	const db = new Kysely({
		dialect: new PostgresDialect({
			pool: new DbPool({
				database: dbName,
			}),
		}),
	});

	console.log('Creating Http server');
	const state = {
		db,
		httpServer: new HttpServer(httpListener(db)),
	};
	state.httpServer.listen(servicePort);
	state.httpServer.on('upgrade', (msg, duplex, head) => {
		if (!msg.url) return;
		const path = msg.url.substring(1).split(/[/?]/)[0];
		console.log('Upgrading', path);
		if (!(path in routes)) {
			console.error('Invalid route', path);
			return;
		}
		const route = routes[path as keyof typeof routes];
		if (!('model' in route && 'stream' in route.model)) {
			console.error('Not a websocket', route);
			duplex.write('HTTP/1.1 400 Not a WebSocket endpoint\r\n\r\n');
			duplex.destroy();
			return;
		}
		// const phrasebook = getDictionary(msg);
		// if (authenticated && !isSessionId(getSessionIdFromRequest(msg))) {
		// 	duplex.write('HTTP/1.1 401 Unauthenticated\r\n\r\n');
		// 	duplex.destroy();
		// 	console.error('Unauthenticated');
		// 	return;
		// }
		if (Object.values(state).length < 4) {
			duplex.write('HTTP/1.1 500 Shit the bed\r\n\r\n');
			duplex.destroy();
			console.error('State < 4');
			return;
		}
		webSocketServer.handleUpgrade(msg, duplex, head, (ws) => {
			handleConnection(ws, msg); // Call the connection handler directly
			console.info('Upgraded HTTP to WebSocket', path);
		});
	});

	const httpServer = new HttpServer(httpListener(db));

	httpServer.listen(servicePort, () => {
		console.log('Http server listening on port', servicePort);
	});
};
