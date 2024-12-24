import { handleDeleteGroup } from '@lyku/handles';

export const deleteGroup = handleDeleteGroup(
	async ({ id }, { db, requester }) => {
		const group = await db
			.selectFrom('groups')
			.where('id', '=', id)
			.executeTakeFirst();
		const youCanEdit = group?.owner === requester;
		if (!youCanEdit) {
			throw new Error('That is not your toy to play with');
		}
		await db.deleteFrom('groups').where('id', '=', id).execute();
		return {};
	}
);
