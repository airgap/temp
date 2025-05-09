import { handleUpdateGroup } from '@lyku/handles';
import { Err } from '@lyku/helpers';
import { client as pg } from '@lyku/postgres-client';

export default handleUpdateGroup(async (params, { requester }) => {
	// First check if user owns the group
	const group = await pg
		.selectFrom('groups')
		.where('id', '=', params.id)
		.where('owner', '=', requester) // Check ownership
		.selectAll()
		.executeTakeFirst();

	if (!group) {
		throw new Err(
			404,
			'Group not found or you do not have permission to edit it',
		);
	}

	// If we get here, user owns the group, so perform update
	const updatedGroup = await pg
		.updateTable('groups')
		.set(params)
		.where('id', '=', params.id)
		.returningAll()
		.executeTakeFirst();

	if (!updatedGroup) {
		throw new Err(500);
	}

	return updatedGroup;
});
