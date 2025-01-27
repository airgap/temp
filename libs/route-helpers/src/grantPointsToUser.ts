import { getLevelFromPoints } from '@lyku/helpers';
import { achievements } from '@lyku/stock-docs';
import { Achievement } from '@lyku/json-models';
import { grantAchievementToUser } from './grantAchievementToUser';
import { sendNotification } from './sendNotification';
import { sql } from 'kysely';
import { Database } from '@lyku/db-config/kysely';
import { Kysely } from 'kysely';
const {
	reachLevel10,
	reachLevel20,
	reachLevel30,
	reachLevel40,
	reachLevel50,
	reachLevel60,
	reachLevel70,
} = achievements;
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
	userId: bigint,
	db: Kysely<Database>,
) => {
	console.log('Granting', points, 'points to user', userId);
	const change = await db
		.updateTable('users')
		.set({ points: sql<bigint>`${sql.raw('points')} + ${points}` })
		.where('id', '=', userId)
		.returningAll()
		.executeTakeFirstOrThrow();

	if (change) {
		const newLevel = getLevelFromPoints(change.points);
		const oldLevel = getLevelFromPoints(change.points - BigInt(points));
		if (newLevel > oldLevel) {
			await sendNotification(
				{
					user: userId,
					icon: '/levels/up.png',
					body: 'Reached level ' + newLevel,
					title: 'Level up!',
				},
				db,
			);
			if (newLevel in levelMap)
				await grantAchievementToUser(
					levelMap[newLevel as keyof typeof levelMap],
					userId,
					db,
				);
		}
	}
};
