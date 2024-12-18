import { useContract } from '../Contract';
import { FromSchema } from 'from-schema';
import { user, monolith } from 'models';
export const getUsersById = useContract(
	monolith.getUsersById,
	async (users, { tables, connection }) => {
		const unsorted = await tables.users
			.getAll(...users)
			.coerceTo('array')
			.run(connection);
		const sorted: FromSchema<typeof user>[] = [];
		for (const u of users) {
			const i = unsorted.findIndex(({ id }) => id === u);
			sorted.push(unsorted[i]);
			unsorted.splice(i, 1);
		}
		return sorted;
	},
);
