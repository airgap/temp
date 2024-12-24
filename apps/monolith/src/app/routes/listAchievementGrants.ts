import { monolith } from 'models';
import { useContract } from '../Contract';

export const listAchievementGrants = useContract(
	monolith.listAchievementGrants,
	({ game }, { tables: { achievementGrants }, connection }, { userId }) => {
		{
			const mine = achievementGrants.getAll(userId, { index: 'user' });
			const query = game ? mine.filter<false>({ game }) : mine;

			return query.coerceTo('array').run(connection);
		}
	}
);
