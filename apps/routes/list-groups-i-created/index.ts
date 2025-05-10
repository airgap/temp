import { handleListGroupsICreated } from '@lyku/handles';
import { client as pg } from '@lyku/postgres-client';
export default handleListGroupsICreated((_, { requester }) =>
	pg
		.selectFrom('groups')
		.selectAll()
		.where('creator', '=', requester)
		.execute(),
);
