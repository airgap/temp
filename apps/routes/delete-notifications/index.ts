import { handleDeleteNotifications } from '@lyku/handles';
import { client as pg } from '@lyku/postgres-client';
import { grantPointsToUser } from '@lyku/route-helpers';

export default handleDeleteNotifications(
	async ({ notificationIds }, { requester }) => {
		const result = await pg.transaction().execute(async (trx) => {
			if (notificationIds && notificationIds.length > 0) {
				const claimables = await trx
					.selectFrom('notifications')
					.selectAll()
					.where('user', '=', requester)
					.where('id', 'in', notificationIds)
					.where('points', 'is not', null)
					.execute();
				for (const claimable of claimables) {
					await grantPointsToUser(claimable.points ?? 0, requester, trx);
				}
				// Mark specific notifications as read
				await trx
					.updateTable('notifications')
					.set({ deleted: new Date() })
					.where('user', '=', requester)
					.where('id', 'in', notificationIds)
					.execute();
			} else {
				const claimables = await trx
					.selectFrom('notifications')
					.selectAll()
					.where('user', '=', requester)
					.where('points', 'is not', null)
					.execute();
				for (const claimable of claimables) {
					await grantPointsToUser(claimable.points ?? 0, requester, trx);
				}
				// Mark all notifications as read
				await trx
					.updateTable('notifications')
					.set({ deleted: new Date() })
					.where('user', '=', requester)
					.execute();
			}
		});
		console.log('Delete notifications transaction', result);
		return { success: true };
	},
);
