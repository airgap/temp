import { handleCreateFriendRequest } from '@lyku/handles';
import { bondIds } from '@lyku/helpers';
import { client as pg } from '@lyku/postgres-client';
export default handleCreateFriendRequest(async (user, { requester }) => {
	const them = await pg
		.selectFrom('users')
		.selectAll()
		.where('id', '=', user)
		.executeTakeFirst();
	if (!them) throw new Error('Target user does not exist');
	const id = bondIds(requester, user);
	await pg
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
