import { handleMarkNotificationsRead } from '@lyku/handles';
import { client as pg } from '@lyku/postgres-client';

export default handleMarkNotificationsRead(
	async ({ notificationIds }, { requester }) => {
		if (notificationIds && notificationIds.length > 0) {
			// Mark specific notifications as read
			await pg
				.updateTable('notifications')
				.set({ read: new Date() })
				.where('user', '=', requester)
				.where('id', 'in', notificationIds)
				.where('read', 'is', null)
				.execute();
		} else {
			// Mark all notifications as read
			await pg
				.updateTable('notifications')
				.set({ read: new Date() })
				.where('user', '=', requester)
				.where('read', 'is', null)
				.execute();
		}

		return { success: true };
	},
);
