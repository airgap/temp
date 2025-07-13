import type { Achievement, AchievementGrant } from '@lyku/json-models';
import { grantPointsToUser } from './grantPointsToUser';
import { sendNotification } from './sendNotification';
import type { Kysely } from 'kysely';
import { bindIds } from '@lyku/helpers';
import type { Database } from '@lyku/db-types';

export const grantAchievementToUser = async (
	achievement: bigint | Achievement,
	user: bigint,
	db: Kysely<Database>,
) => {
	console.log('Granting achievement to user', user);
	const ach =
		typeof achievement === 'bigint'
			? await db
					.selectFrom('achievements')
					.selectAll()
					.where('id', '=', achievement)
					.executeTakeFirstOrThrow()
			: achievement;
	console.log('Achievement', ach);
	const result = await db
		.insertInto('achievementGrants')
		.values({
			achievement: ach.id,
			granted: new Date(),
			user,
			...(ach.game ? { game: ach.game } : {}),
		} as AchievementGrant)
		.onConflict((oc) => oc.columns(['achievement', 'user']).doNothing())
		.returningAll()
		.executeTakeFirst();
	console.log('Granted achievement?', result);
	if (ach.points) await grantPointsToUser(ach.points, user, db);
	if (result)
		await sendNotification(
			{
				user,
				title: 'ACHIEVEMENT',
				body: ach.name,
				icon: ach.icon,
				href: `/achievements/${ach.id}`,
			},
			db,
		);
};
