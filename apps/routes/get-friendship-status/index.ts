import { handleGetFriendshipStatus } from '@lyku/handles';
import { bondIds } from '@lyku/helpers';

handleGetFriendshipStatus(async (user, { db, requester, strings }) => {
	const bond = bondIds(requester, user);
	const befriended = await db
		.selectFrom('friendships')
		.selectAll()
		.where('id', '=', bond)
		.executeTakeFirst();
	if (befriended) return 'befriended';
	const request = await db
		.selectFrom('friendRequests')
		.selectAll()
		.where('id', '=', bond)
		.executeTakeFirst();
	if (!request) return 'none';
	return request.from === requester ? 'youOffered' : 'theyOffered';
});
