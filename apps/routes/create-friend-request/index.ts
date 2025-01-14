import { handleCreateFriendRequest } from '@lyku/handles';
import { bondIds } from '@lyku/helpers';

export default handleCreateFriendRequest(async (user, { db, requester }) => {
	const them = await db
		.selectFrom('users')
		.selectAll()
		.where('id', '=', user)
		.executeTakeFirst();
	if (!them) throw new Error('Target user does not exist');
	const id = bondIds(requester, user);
	await db
		.insertInto('friendRequests')
		.values({
			id,
			created: new Date(),
			from: requester,
			to: user,
		})
		.execute();
	return { id };
});
