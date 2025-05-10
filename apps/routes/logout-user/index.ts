import { handleLogoutUser } from '@lyku/handles';
import { client as pg } from '@lyku/postgres-client';

export default handleLogoutUser(
	async ({ everywhere }, { session, requester, strings }) => {
		everywhere
			? pg
					.deleteFrom('sessions')
					.where('userId', '=', requester)
					.executeTakeFirstOrThrow()
			: pg
					.deleteFrom('sessions')
					.where('id', '=', session)
					.executeTakeFirstOrThrow();
	},
);
