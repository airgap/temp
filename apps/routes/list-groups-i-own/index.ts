import { handleListGroupsIOwn } from '@lyku/handles';

export default handleListGroupsIOwn((_, { db, requester }) =>
	db.selectFrom('groups').selectAll().where('owner', '=', requester).execute(),
);
