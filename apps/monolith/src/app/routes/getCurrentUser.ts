import { useContract } from '../Contract';
import { guestUser, monolith } from 'models';

export const getCurrentUser = useContract(
	monolith.getCurrentUser,
	async (_, { tables, connection }, { userId }, strings) => {
		if (!tables) {
			console.error('Tables fucked');
			throw new Error(strings.unknownBackendError);
		}
		userId ??= guestUser.id;
		return tables.users.get(userId).run(connection);
	},
);
