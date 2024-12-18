import { monolith } from 'models';
import { useContract } from '../Contract';

export const deleteGroup = useContract(
	monolith.deleteGroup,
	async ({ id }, { tables, connection }, { userId }) => {
		const groupExists = tables.groups.get(id);
		const youCanEdit = groupExists('owner').eq(userId);
		const res = await groupExists
			.branch(
				youCanEdit.branch(groupExists.delete(), {
					error: 'That is not your toy to play with',
				}),
				{ error: 'Group not found, maybe make it?' },
			)
			.run(connection);
		if ('error' in res) {
			throw new Error(res.error);
		}

		return {};
	},
);
