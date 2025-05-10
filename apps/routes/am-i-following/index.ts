import { bindIds } from '@lyku/helpers';
import { handleAmIFollowing } from '@lyku/handles';
import { client as pg } from '@lyku/postgres-client';
export default handleAmIFollowing((user, { requester }) =>
	pg
		.selectFrom('userFollows')
		.where('id', '=', bindIds(requester, user))
		.executeTakeFirst()
		.then((r) => r !== null),
);
