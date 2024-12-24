import { handleDeleteFriendship } from '@lyku/handles';
import { bondIds } from '@lyku/helpers';

export const deleteFriendship = handleDeleteFriendship(
	async (user, { db, requester }) => {
		const bond = bondIds(requester, user);
		await db.deleteFrom('friendships').where('id', '=', bond).execute();
		return { status: 'none' };
	}
);
