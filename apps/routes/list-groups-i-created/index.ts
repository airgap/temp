import { handleListGroupsICreated } from '@lyku/handles';

export default handleListGroupsICreated((_, { db, requester }) =>
	db.selectFrom('groups').selectAll().where('creator', '=', requester).execute()
);
