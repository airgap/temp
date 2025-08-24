import { handleGetGroups } from '@lyku/handles';
import { client as pg } from '@lyku/postgres-client';
export default handleGetGroups(async (ids, {}) => {
	const bigintIds = ids.filter((id) => typeof id === 'bigint') as bigint[];
	const slugs = ids.filter((id) => typeof id === 'string') as string[];
	console.log('bigintIds', bigintIds, 'slugs', slugs);
	const groups = await pg
		.selectFrom('groups')
		.selectAll()
		.where((eb) =>
			eb.or([
				...(bigintIds.length > 0 ? [eb('id', 'in', bigintIds)] : []),
				...(slugs.length > 0 ? [eb('slug', 'in', slugs)] : []),
			]),
		)
		.execute();
	console.log('groups', groups);
	return {
		groups,
	};
});
