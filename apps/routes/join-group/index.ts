import { handleJoinGroup } from '@lyku/handles';
import { bindIds } from '@lyku/helpers';
handleJoinGroup(async (group, { db, requester }) => {
	const groupData = await db
		.selectFrom('groups')
		.select('private')
		.where('id', '=', group)
		.executeTakeFirst();

	if (groupData?.private === false) {
		const res = await db
			.insertInto('groupMemberships')
			.values({
				group,
				user: requester,
				id: bindIds(requester, group),
				created: new Date(),
			})
			.executeTakeFirst();

		if (!res) throw new Error('Cannot join');
	} else {
		throw new Error('Cannot join');
	}
});
