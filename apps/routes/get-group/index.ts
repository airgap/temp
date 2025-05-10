import { handleGetGroup } from '@lyku/handles';
import { bindIds } from '@lyku/helpers';
import { client as pg } from '@lyku/postgres-client';
export default handleGetGroup(async (id, {  requester }) => {
	const group = await pg
		.selectFrom('groups')
		.selectAll()
		.where('id', '=', id)
		.executeTakeFirst();
	if (!group) throw 404;
	const membership =
		requester &&
		(await pg
			.selectFrom('groupMemberships')
			.selectAll()
			.where('id', '=', bindIds(requester, id))
			.executeTakeFirst());
	return {
		group,
		...(typeof membership === 'object' ? { membership } : {}),
	};
});
