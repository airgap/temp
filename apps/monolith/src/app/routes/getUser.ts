import { monolith } from 'models';
import { useContract } from '../Contract';
export const getUser = useContract(
	monolith.getUser,
	(username, { tables, connection }) =>
		tables.users.getAll(username, { index: 'username' })(0).run(connection)
);
