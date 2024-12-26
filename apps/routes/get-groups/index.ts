import { handleGetGroups } from '@lyku/handles';

handleGetGroups((ids, { db }) =>
	db.selectFrom('groups').selectAll().where('id', 'in', ids).execute()
);
