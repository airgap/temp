import { handleDeleteFriendship } from '@lyku/handles';
import { bondIds } from '@lyku/helpers';

export default handleDeleteFriendship(async (user, { db, requester }) => {
	await db
		.deleteFrom('friendships')
		.where('id', '=', bondIds(requester, user))
		.execute();
});
