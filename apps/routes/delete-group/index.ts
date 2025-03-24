import { handleDeleteGroup } from '@lyku/handles';
import { Err } from '@lyku/helpers';

export default handleDeleteGroup(async ({ id }, { db, requester }) => {
	const { owner } = await db
		.selectFrom('groups')
		.select('owner')
		.where('id', '=', id)
		.executeTakeFirstOrThrow();
	if (owner !== requester)
		throw new Err(403, 'That is not your toy to play with');
	await db.deleteFrom('groups').where('id', '=', id).execute();
});
