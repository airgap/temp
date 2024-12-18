import { IncomingMessage } from 'http';
import { Connection, Insertable, now } from 'rethinkdb';

import { generateSessionId } from './generateSessionId';
import { ActualTables } from './types/ActualTables';
import { FromSchema } from 'from-schema';
import { session, sessionId, userLogin as userLoginSchema } from 'models';

export const createSessionForUser = async (
	userId: string,
	msg: IncomingMessage,
	tables: ActualTables,
	connection: Connection,
): Promise<FromSchema<typeof sessionId>> => {
	const id = generateSessionId();
	const userLogin: Insertable<FromSchema<typeof userLoginSchema>> = {
		created: now(),
		ip:
			(msg.headers['CF-Connecting-IP'] as string) ?? msg.headers.location ?? '',
		userId,
	};
	const s: FromSchema<typeof session> = {
		...userLogin,
		id,
		expiration: now().add(60 * 60 * 24 * 30),
	};
	await Promise.all([
		tables.logins.insert(userLogin).run(connection),
		tables.sessions.insert(s).run(connection),
	]);
	return id;
};
