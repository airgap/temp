import { handleDeleteFriendship } from '@lyku/handles';
import { bondIds, Err } from '@lyku/helpers';
import { client as pg } from '@lyku/postgres-client';
export default handleDeleteFriendship(async (user, { requester }) => {
	const res = await pg
		.deleteFrom('friendships')
		.where('id', '=', bondIds(requester, user))
		.executeTakeFirst();
	if (res.numDeletedRows === 0n) throw new Err(404);
});
