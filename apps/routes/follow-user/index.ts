import { handleFollowUser } from '@lyku/handles';
import { bindIds } from '@lyku/helpers';

handleFollowUser(async (user, { db, requester }) => {
	const id = bindIds(requester, user);
	const them = await db
		.selectFrom('users')
		.selectAll()
		.where('id', '=', user)
		.executeTakeFirst();
	const follow = await db
		.selectFrom('userFollows')
		.selectAll()
		.where('id', '=', id)
		.executeTakeFirst();
	if (them && !follow) {
		await db
			.insertInto('userFollows')
			.values({
				id,
				follower: requester,
				followee: user,
				created: new Date(),
			})
			.execute();
	}
});
