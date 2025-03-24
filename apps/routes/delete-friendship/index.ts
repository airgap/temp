import { handleDeleteFriendship } from '@lyku/handles';
import { bondIds, Err } from '@lyku/helpers';

export default handleDeleteFriendship(async (user, { db, requester }) => {
	const res = await db
		.deleteFrom('friendships')
		.where('id', '=', bondIds(requester, user))
		.executeTakeFirst();
	if (res.numDeletedRows === 0n) throw new Err(404);
});
