import { handleListNotifications } from '@lyku/handles';
import { client as pg } from '@lyku/postgres-client';
import type { Notification } from '@lyku/json-models';

export default handleListNotifications(
	async ({ limit = 20, offset = 0 }, { requester }) => {
		const notifications = await pg
			.selectFrom('notifications')
			.where('user', '=', requester)
			.where('deleted', 'is', null)
			.orderBy('posted', 'desc')
			.limit(limit)
			.offset(offset)
			.selectAll()
			.execute();

		const unreadCount = await pg
			.selectFrom('notifications')
			.where('user', '=', requester)
			.where('deleted', 'is', null)
			.where('read', 'is', null)
			.select((eb) => eb.fn.count('id').as('count'))
			.executeTakeFirstOrThrow();

		const unclaimedCount = await pg
			.selectFrom('notifications')
			.where('user', '=', requester)
			.where('deleted', 'is', null)
			.where('points', 'is not', null)
			.select((eb) => eb.fn.count('id').as('count'))
			.executeTakeFirstOrThrow();

		return {
			notifications: notifications as Notification[],
			unreadCount: Number(unreadCount.count) || 0,
			unclaimedCount: Number(unclaimedCount.count) || 0,
		};
	},
);
