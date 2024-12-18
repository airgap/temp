import { Kysely } from 'kysely';

import { isSessionId } from './isSessionId';
import { Database } from '@lyku/json-models/kysely';
import { Messagish } from './Messagish';
import { getSessionIdFromRequest } from './getSessionIdFromRequest';
import { SessionId, UserId } from '@lyku/json-models';

export const getUserId = async (
	msgOrSessionId: Messagish | string,
	db: Kysely<Database>,
): Promise<UserId> => {
	const sessionId =
		typeof msgOrSessionId === 'string'
			? msgOrSessionId
			: getSessionIdFromRequest(msgOrSessionId);

	if (!isSessionId(sessionId)) throw new Error('498');

	const session = await db
		.selectFrom('sessions')
		.select('userId')
		.where('id', '=', sessionId)
		.executeTakeFirst();

	if (!session?.userId) throw new Error('498');

	return session.userId;

	// Bot token logic would look something like this:
	// const user = await db
	//     .selectFrom('users')
	//     .select('id')
	//     .where('id', '=', botId)
	//     .where('botToken', '=', token)
	//     .executeTakeFirst();
	//
	// if (!user?.id) throw new Error('498');
	// return user.id;
};
