import { handleFollowUser } from '@lyku/handles';
import { bindIds } from '@lyku/helpers';
import { client as pg } from '@lyku/postgres-client';
export default handleFollowUser(async (user, { requester }) => {
	const id = bindIds(requester, user);
	const them = await pg
		.selectFrom('users')
		.selectAll()
		.where('id', '=', user)
		.executeTakeFirst();
	const follow = await pg
		.selectFrom('userFollows')
		.selectAll()
		.where('id', '=', id)
		.executeTakeFirst();
	if (them && !follow) {
		await pg
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
