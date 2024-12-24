import { handleAcceptFriendRequest } from '@lyku/handles';
import { bondIds } from '@lyku/helpers';

export const acceptFriendRequest = handleAcceptFriendRequest(
	async (user, { requester, db }) => {
		const result = await db
			.insertInto('friendships')
			.columns(['id', 'users', 'created'])
			.expression((eb) =>
				eb
					.selectFrom('friendRequests')
					.select([
						'id',
						eb.val([requester, user]).as('users'),
						eb.val(new Date()).as('created'),
					])
					.where('id', '=', bondIds(requester, user))
			)
			.returningAll()
			.execute();

		if (result.length === 0) {
			throw new Error('404');
		}
	}
);
