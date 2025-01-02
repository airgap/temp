import { bindIds } from '@lyku/helpers';

import { handleLeaveGroup } from '@lyku/handles';

export default handleLeaveGroup(async (group, { db, requester }) => {
	const membership = await db
		.selectFrom('groupMemberships')
		.selectAll()
		.where('id', '=', bindIds(requester, group))
		.executeTakeFirst();

	const groupData = await db
		.selectFrom('groups')
		.select('owner')
		.where('id', '=', group)
		.executeTakeFirst();

	if (membership && groupData?.owner !== requester) {
		const res = await db
			.deleteFrom('groupMemberships')
			.where('id', '=', bindIds(requester, group))
			.executeTakeFirst();

		if (!res) throw new Error('Cannot leave group');
	} else {
		throw new Error('Cannot leave group');
	}
});
