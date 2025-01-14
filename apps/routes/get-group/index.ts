import { handleGetGroup } from '@lyku/handles';
import { bindIds } from '@lyku/helpers';

export default handleGetGroup(async (id, { db, requester }) => {
	const group = await db
		.selectFrom('groups')
		.selectAll()
		.where('id', '=', id)
		.executeTakeFirst();
	if (!group) throw 404;
	const membership =
		requester &&
		(await db
			.selectFrom('groupMemberships')
			.selectAll()
			.where('id', '=', bindIds(requester, id))
			.executeTakeFirst());
	return {
		group,
		...(typeof membership === 'object' ? { membership } : {}),
	};
});
