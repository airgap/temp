import { handleDeclineFriendRequest } from '@lyku/handles';
import { bondIds } from '@lyku/helpers';
import { client as pg } from '@lyku/postgres-client';
export default handleDeclineFriendRequest(async (user, { requester }) => {
	const bond = bondIds(requester, user);
	await pg.deleteFrom('friendRequests').where('id', '=', bond).execute();
});
