import { handleDeleteGroup } from '@lyku/handles';

export default handleDeleteGroup(async ({ id }, { db, requester }) => {
	const { owner } = await db
		.selectFrom('groups')
		.select('owner')
		.where('id', '=', id)
		.executeTakeFirstOrThrow();
	if (owner !== requester) throw new Error('That is not your toy to play with');
	await db.deleteFrom('groups').where('id', '=', id).execute();
});
