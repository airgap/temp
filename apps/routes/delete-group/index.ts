import { handleDeleteGroup } from '@lyku/handles';
import { Err } from '@lyku/helpers';
import { client as pg } from '@lyku/postgres-client';
export default handleDeleteGroup(async ({ id }, { requester }) => {
	const { owner } = await pg
		.selectFrom('groups')
		.select('owner')
		.where('id', '=', id)
		.executeTakeFirstOrThrow();
	if (owner !== requester)
		throw new Err(403, 'That is not your toy to play with');
	await pg.deleteFrom('groups').where('id', '=', id).execute();
});
