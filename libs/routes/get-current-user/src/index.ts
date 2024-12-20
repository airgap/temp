import { handleGetCurrentUser } from '@lyku/handles';

handleGetCurrentUser(
	async (_, { db, requester, strings }) => {
		const user = await db.selectFrom('users').selectAll().where('id', '=', requester).executeTakeFirst();
		if (!user) {
			throw new Error('User not found');
		}
		return user;
	},
);
