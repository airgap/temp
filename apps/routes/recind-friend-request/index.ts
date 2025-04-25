import { handleRecindFriendRequest } from '@lyku/handles';
import { bondIds } from '@lyku/helpers';

export default handleRecindFriendRequest(async (user, { db, requester }) => {
	const bond = bondIds(requester, user);
	await db.deleteFrom('friendRequests').where('id', '=', bond).execute();
});
