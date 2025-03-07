import { handleListGroupsUnauthenticated } from '@lyku/handles';

export default handleListGroupsUnauthenticated((_, { db }) =>
	db.selectFrom('groups').selectAll().execute()
);
