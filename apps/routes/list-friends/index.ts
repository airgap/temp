import { handleListFriends } from '@lyku/handles';
import { client as pg } from '@lyku/postgres-client';
export default handleListFriends(async (_, { requester }) => {
	// Set work_mem higher for this specific query if needed
	// await db.executeQuery('SET LOCAL work_mem = "100MB"');

	const friends = await pg
		.selectFrom('users')
		.selectAll()
		.innerJoin(
			pg
				.selectFrom('friendLists')
				.select([
					pg.fn
						.agg('unnest', [(eb) => eb.ref('friendLists.friends')])
						.as('friendId'),
				])
				.where('user', '=', requester)
				.where('count', '>', 0) // Use materialized column
				.as('friends'),
			'users.id',
			'friends.friendId',
		)
		.execute();
	return friends;
});
