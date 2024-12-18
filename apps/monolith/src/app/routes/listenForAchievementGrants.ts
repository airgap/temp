import { monolith } from 'models';
import { useContract } from '../Contract';
import { feedSocket } from '../../feedSocket';

export const listenForAchievementGrants = useContract(
	monolith.listenForAchievementGrants,
	async ({ game }, { tables, connection }, { socket, userId }) => {
		const all = tables.achievementGrants.getAll(userId, { index: 'user' });
		void feedSocket(
			socket,
			game ? all.filter<false>({ game }) : all,
			connection,
			{ includeInitial: true },
		);
	},
);
