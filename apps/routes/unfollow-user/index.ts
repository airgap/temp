import { bindIds } from '@lyku/helpers';
import { handleUnfollowUser } from '@lyku/handles';
import { client as pg } from '@lyku/postgres-client';

export default handleUnfollowUser(async (user, { requester }) => {
	const bond = bindIds(requester, user);
	const res = await pg
		.deleteFrom('userFollows')
		.where('id', '=', bond)
		.executeTakeFirstOrThrow();
	if (!res) throw 404;
});
