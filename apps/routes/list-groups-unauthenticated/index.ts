import { handleListGroupsUnauthenticated } from '@lyku/handles';
import { client as pg } from '@lyku/postgres-client';
export default handleListGroupsUnauthenticated(() =>
	pg.selectFrom('groups').selectAll().execute(),
);
