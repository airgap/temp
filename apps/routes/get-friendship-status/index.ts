import { handleGetFriendshipStatus } from '@lyku/handles';
import { bondIds } from '@lyku/helpers';
import { client as pg } from '@lyku/postgres-client';
export default handleGetFriendshipStatus(
	async (user, { requester, strings }) => {
		const bond = bondIds(requester, user);
		const befriended = await pg
			.selectFrom('friendships')
			.selectAll()
			.where('id', '=', bond)
			.executeTakeFirst();
		if (befriended) return 'befriended';
		const request = await pg
			.selectFrom('friendRequests')
			.selectAll()
			.where('id', '=', bond)
			.executeTakeFirst();
		if (!request) return 'none';
		return request.from === requester ? 'youOffered' : 'theyOffered';
	},
);
