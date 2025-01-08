import { handleListFriends } from '@lyku/handles';

export default handleListFriends(async (_, { db, requester }) =>
	db.selectFrom('friends').selectAll().where('user', '=', requester).execute()
);
