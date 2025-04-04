import { bindIds } from '@lyku/helpers';
import { handleAmIFollowing } from '@lyku/handles';
export default handleAmIFollowing((user, { db, requester }) =>
	db
		.selectFrom('userFollows')
		.where('id', '=', bindIds(requester, user))
		.executeTakeFirst()
		.then((r) => r !== null),
);
