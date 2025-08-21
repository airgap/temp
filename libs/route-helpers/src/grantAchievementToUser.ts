import type { Achievement, AchievementGrant } from '@lyku/json-models';
import { grantPointsToUser } from './grantPointsToUser';
import { sendNotification } from './sendNotification';
import type { Kysely, Transaction } from 'kysely';
import { bindIds } from '@lyku/helpers';
import type { Database } from '@lyku/db-types';
import { client as pg } from '@lyku/postgres-client';

export const grantAchievementToUser = async (
	achievement: bigint | Achievement,
	user: bigint,
	trx?: Transaction<Database>,
) => {
	console.log('Granting achievement to user', user);
	const grantOnTransaction = async (trx: Transaction<Database>) => {
		const ach =
			typeof achievement === 'bigint'
				? await trx
						.selectFrom('achievements')
						.selectAll()
						.where('id', '=', achievement)
						.executeTakeFirstOrThrow()
				: achievement;
		console.log('Achievement', ach);
		const result = await trx
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
		if (ach.points) await grantPointsToUser(ach.points, user, trx);
		return { result, ach };
	};
	const { result, ach } = trx
		? await grantOnTransaction(trx)
		: await pg
				.transaction()
				.execute(async (trx) => await grantOnTransaction(trx));
	if (result)
		await sendNotification({
			user,
			title: 'You got an achievement!',
			body: ach.name,
			icon: ach.icon,
			href: `/achievements/${ach.id}`,
		});
};
