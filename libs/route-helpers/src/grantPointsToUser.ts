import { getLevelFromPoints } from '@lyku/helpers';
import { achievements } from '@lyku/stock-docs';
import type { Achievement } from '@lyku/json-models';
import { grantAchievementToUser } from './grantAchievementToUser';
import { sendNotification } from './sendNotification';
import { sql } from 'kysely';
import type { Database } from '@lyku/db-types';
import type { Kysely, Transaction } from 'kysely';
import { client as pg } from '@lyku/postgres-client';
import { client as redis } from '@lyku/redis-client';
import { client as nats } from '@lyku/nats-client';
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
	trx?: Transaction<Database>,
) => {
	console.log('Granting', points, 'points to user', userId);
	const change = await (trx ?? pg)
		.updateTable('users')
		.set({ points: sql<bigint>`${sql.raw('points')} + ${points}` })
		.where('id', '=', userId)
		.returningAll()
		.executeTakeFirstOrThrow();
	redis.del(`user:${userId}`);
	console.log('change', change);
	nats.publish(`user:${userId}:points`, change.points.toString());
	if (change) {
		const newLevel = getLevelFromPoints(change.points);
		const oldLevel = getLevelFromPoints(change.points - BigInt(points));
		if (newLevel > oldLevel) {
			console.log('Sending notification');
			await sendNotification({
				user: userId,
				icon: '/up.png',
				body: 'Reached level ' + newLevel,
				title: 'Level up!',
			});
			// if (newLevel in levelMap)
			// 	await grantAchievementToUser(
			// 		levelMap[newLevel as keyof typeof levelMap],
			// 		userId,
			// 		trx,
			// 	);
		}
	}
};
