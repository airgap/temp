import { handleDeleteNotifications } from '@lyku/handles';
import { client as pg } from '@lyku/postgres-client';

export default handleDeleteNotifications(
	async ({ notificationIds }, { requester }) => {
		if (notificationIds && notificationIds.length > 0) {
			// Mark specific notifications as read
			await pg
				.updateTable('notifications')
				.set({ deleted: new Date() })
				.where('user', '=', requester)
				.where('id', 'in', notificationIds)
				.execute();
		} else {
			// Mark all notifications as read
			await pg
				.updateTable('notifications')
				.set({ deleted: new Date() })
				.where('user', '=', requester)
				.execute();
		}

		return { success: true };
	},
);
