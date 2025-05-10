import { handleListGroupsIOwn } from '@lyku/handles';
import { client as pg } from '@lyku/postgres-client';
export default handleListGroupsIOwn((_, { requester }) =>
	pg.selectFrom('groups').selectAll().where('owner', '=', requester).execute(),
);
