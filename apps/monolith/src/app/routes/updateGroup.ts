import { handleUpdateGroup } from '@lyku/handles';

export const updateGroup = handleUpdateGroup(async (params, ctx) => {
	// First check if user owns the group
	const group = await ctx.db
		.selectFrom('groups')
		.where('id', '=', params.id)
		.where('owner', '=', ctx.requester) // Check ownership
		.selectAll()
		.executeTakeFirst();

	if (!group) {
		throw new Error('Group not found or you do not have permission to edit it');
	}

	// If we get here, user owns the group, so perform update
	const updatedGroup = await ctx.db
		.updateTable('groups')
		.set(params)
		.where('id', '=', params.id)
		.returningAll()
		.executeTakeFirst();

	if (!updatedGroup) {
		throw new Error(ctx.strings.unknownBackendError);
	}

	return { group: updatedGroup };
});
