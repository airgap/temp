import { bindIds } from '@lyku/helpers';
import { handleUnfollowUser } from '@lyku/handles';

export default handleUnfollowUser(async (user, { db, requester }) => {
	const bond = bindIds(requester, user);
	const res = await db
		.deleteFrom('userFollows')
		.where('id', '=', bond)
		.executeTakeFirstOrThrow();
	if (!res) throw 404;
});
