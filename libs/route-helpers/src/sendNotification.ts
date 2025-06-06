import type { Notification } from '@lyku/json-models';
import type { Kysely } from 'kysely';
import type { Database } from '@lyku/db-types';

export const sendNotification = async (
	notification: Omit<Notification, 'posted' | 'id'>,
	db: Kysely<Database>,
): Promise<Notification> =>
	db
		.insertInto('notifications')
		.values(notification as Notification)
		.returningAll()
		.executeTakeFirstOrThrow();
