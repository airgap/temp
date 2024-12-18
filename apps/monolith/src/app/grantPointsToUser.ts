import { getLevelFromPoints } from 'helpers';
import { HardenedState } from './types/State';
import {
	reachLevel10,
	reachLevel20,
	reachLevel30,
	reachLevel40,
	reachLevel50,
	reachLevel60,
	reachLevel70,
} from 'models';
import { Achievement } from 'models';
import { grantAchievementToUser } from './grantAchievementToUser';
import { sendNotification } from './sendNotification';

const levelMap = {
	10: reachLevel10,
	20: reachLevel20,
	30: reachLevel30,
	40: reachLevel40,
	50: reachLevel50,
	60: reachLevel60,
	70: reachLevel70,
} satisfies Record<number, Achievement>;

export const grantPointsToUser = async (
	points: number,
	userId: string,
	state: HardenedState,
) => {
	console.log('Granting', points, 'points to user', userId);
	const { tables, connection } = state;
	const update = await tables.users
		.get(userId)
		.update((u) => ({ points: u('points').default(0).add(points) }), {
			returnChanges: true,
		})
		.run(connection);
	const change = update.changes[0];
	if (change) {
		const newLevel = getLevelFromPoints(change.new_val.points);
		const oldLevel = getLevelFromPoints(change.old_val.points);
		if (newLevel > oldLevel) {
			await sendNotification(
				{
					user: userId,
					icon: '/levels/up.png',
					body: 'Reached level ' + newLevel,
					title: 'Level up!',
				},
				state,
			);
			if (newLevel in levelMap)
				await grantAchievementToUser(
					levelMap[newLevel as keyof typeof levelMap],
					userId,
					state,
				);
		}
	}
};
