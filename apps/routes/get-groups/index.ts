import { handleGetGroups } from '@lyku/handles';

export default handleGetGroups((ids, { db }) =>
	db.selectFrom('groups').selectAll().where('id', 'in', ids).execute(),
);
