import { handleJoinGroup } from '@lyku/handles';
import { bindIds } from '@lyku/helpers';
import { client as pg } from '@lyku/postgres-client';

export default handleJoinGroup(async (group, { requester, now }) => {
	const groupData = await pg
		.selectFrom('groups')
		.select('private')
		.where('id', '=', group)
		.executeTakeFirst();

	if (groupData?.private === false) {
		const res = await pg
			.insertInto('groupMemberships')
			.values({
				group,
				user: requester,
				id: bindIds(requester, group),
				created: now,
				updated: now,
			})
			.executeTakeFirst();

		if (!res) throw new Error('Cannot join');
	} else {
		throw new Error('Cannot join');
	}
});
