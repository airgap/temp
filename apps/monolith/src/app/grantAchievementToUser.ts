import { Achievement } from 'models';
import { grantPointsToUser } from './grantPointsToUser';
import { HardenedState } from './types/State';
import { now } from 'rethinkdb';
import { bindIds } from 'helpers';
import { sendNotification } from './sendNotification';

export const grantAchievementToUser = async (
	achievement: string | Achievement,
	user: string,
	state: HardenedState,
) => {
	const { tables, connection } = state;
	const ach =
		typeof achievement === 'string'
			? await tables.achievements.get(achievement).run(connection)
			: achievement;
	const id = bindIds(ach.id, user);
	const result = await tables.achievementGrants
		.get(id)
		.default(
			tables.achievementGrants.insert({
				achievement: ach.id,
				granted: now(),
				user,
				id,
				...(ach.game ? { game: ach.game } : {}),
			}),
		)
		.run(connection);
	console.log('Granted achievement?', result);
	if (ach.points) await grantPointsToUser(ach.points, user, state);
	if (typeof result !== 'string')
		await sendNotification(
			{
				user,
				title: 'ACHIEVEMENT',
				body: ach.name,
				icon: ach.icon,
				href: `/achievements/${ach.id}`,
			},
			state,
		);
};
