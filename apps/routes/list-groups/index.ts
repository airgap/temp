import { handleListGroups } from '@lyku/handles';

export default handleListGroups(async (_, { db, requester }) =>
	db.selectFrom('groups').selectAll().where('user', '=', requester).execute()
);
