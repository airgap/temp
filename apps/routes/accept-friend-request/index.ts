import { handleAcceptFriendRequest } from '@lyku/handles';
import { bondIds, Err } from '@lyku/helpers';
import { client as pg } from '@lyku/postgres-client';

export default handleAcceptFriendRequest(async (user, { requester }) => {
	await pg.transaction().execute(async (trx) => {
		const insertResult = await trx
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
					.where('id', '=', bondIds(requester, user)),
			)
			.returningAll()
			.execute();

		await trx
			.deleteFrom('friendRequests')
			.where('id', '=', bondIds(requester, user))
			.execute();

		if (insertResult.length === 0) {
			throw new Err(404, 'Friend request not found');
		}
	});
});
