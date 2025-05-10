import { bindIds } from '@lyku/helpers';

import { handleLeaveGroup } from '@lyku/handles';
import { client as pg } from '@lyku/postgres-client';

export default handleLeaveGroup(async (group, { requester }) => {
	const membership = await pg
		.selectFrom('groupMemberships')
		.selectAll()
		.where('id', '=', bindIds(requester, group))
		.executeTakeFirst();

	const groupData = await pg
		.selectFrom('groups')
		.select('owner')
		.where('id', '=', group)
		.executeTakeFirst();

	if (membership && groupData?.owner !== requester) {
		const res = await pg
			.deleteFrom('groupMemberships')
			.where('id', '=', bindIds(requester, group))
			.executeTakeFirst();

		if (!res) throw new Error('Cannot leave group');
	} else {
		throw new Error('Cannot leave group');
	}
});
