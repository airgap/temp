import { handleLogoutUser } from '@lyku/handles';
import { isSessionId } from '@lyku/route-helpers';
import { session } from 'bson-models';

export default handleLogoutUser(
	async ({ everywhere }, { db, session, requester, strings }) => {
		(await everywhere)
			? db
					.deleteFrom('sessions')
					.where('userId', '=', requester)
					.executeTakeFirstOrThrow()
			: db
					.deleteFrom('sessions')
					.where('id', '=', session)
					.executeTakeFirstOrThrow();
	},
);
