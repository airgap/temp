import { handleGetGroups } from '@lyku/handles';
import { client as pg } from '@lyku/postgres-client';
export default handleGetGroups((ids, {}) =>
	pg.selectFrom('groups').selectAll().where('id', 'in', ids).execute(),
);
