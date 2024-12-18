import { monolith } from 'models';
import { branch } from 'rethinkdb';

import { useContract } from '../Contract';
import { isSessionId } from '../isSessionId';

export const logoutUser = useContract(
	monolith.logoutUser,
	async ({ everywhere }, { tables, connection }, { msg }, strings) => {
		const { sessionid } = msg.headers;
		if (!isSessionId(sessionid)) throw 401;
		const session = tables.sessions.get(sessionid);
		const query = everywhere
			? branch(
					session,
					tables.sessions
						.filter<true>((doc) => doc('userId').eq(session('userId')))
						.delete(),
					{
						deleted: 0,
					},
				)
			: session.delete();
		const { deleted } = await query.run(connection);
		if (deleted) return { deleted, sessionId: '' };
		throw new Error(strings.sessionNotFound);
	},
);
