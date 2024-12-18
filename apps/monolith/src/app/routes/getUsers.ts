import { monolith } from 'models';
import { useContract } from '../Contract';
export const getUsers = useContract(
	monolith.getUsers,
	async ({ users }, { tables, connection }) => ({
		users: await tables.users
			.getAll(users, { index: 'username' })
			.coerceTo('array')
			.run(connection),
	}),
);
