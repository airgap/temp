import { handleListFriends } from '@lyku/handles';

export default handleListFriends(async (_, { db, requester }) => {
	// Set work_mem higher for this specific query if needed
	// await db.executeQuery('SET LOCAL work_mem = "100MB"');

	const friends = await db
		.selectFrom('users')
		.selectAll()
		.innerJoin(
			db
				.selectFrom('friendLists')
				.select([
					db.fn
						.agg('unnest', [(eb) => eb.ref('friendLists.friends')])
						.as('friendId'),
				])
				.where('user', '=', requester)
				.where('count', '>', 0) // Use materialized column
				.as('friends'),
			'users.id',
			'friends.friendId'
		)
		.execute();
	return friends;
});
