import { Achievement } from '@lyku/json-models';
import { grantPointsToUser } from './grantPointsToUser';
import { sendNotification } from './sendNotification';
import { Kysely } from 'kysely';
import { bindIds } from '@lyku/helpers';
import { Database } from '@lyku/db-config/kysely';

export const grantAchievementToUser = async (
	achievement: bigint | Achievement,
	user: bigint,
	db: Kysely<Database>
) => {
	const ach =
		typeof achievement === 'bigint'
			? await db
					.selectFrom('achievements')
					.selectAll()
					.where('id', '=', achievement)
					.executeTakeFirstOrThrow()
			: achievement;
	const id = bindIds(ach.id, user);
	const result = await db
		.insertInto('achievementGrants')
		.values({
			achievement: ach.id,
			granted: new Date(),
			user,
			id,
			...(ach.game ? { game: ach.game } : {}),
		})
		.onConflict((oc) => oc.column('id').doNothing())
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
			db
		);
};
