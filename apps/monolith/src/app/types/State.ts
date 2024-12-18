import { Server as HttpServer } from 'http';
import { Server as HttpsServer } from 'https';
import { Database } from '@lyku/db-config/kysely';
import { Kysely } from 'kysely';

export type State = {
	db: Kysely<Database>;
	requester?: bigint;
	isSecure?: boolean;
	httpServer?: HttpServer | HttpsServer;
};
