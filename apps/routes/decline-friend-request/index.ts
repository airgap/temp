import { handleDeclineFriendRequest } from '@lyku/handles';
import { bondIds } from '@lyku/helpers';

export const declineFriendRequest = handleDeclineFriendRequest(
	async (user, { db, requester }) => {
		const bond = bondIds(requester, user);
		await db.deleteFrom('friendRequests').where('id', '=', bond).execute();
	}
);
