import { Notification } from '@lyku/json-models';
import { Kysely } from 'kysely';
import { Database } from '@lyku/db-config/kysely';

export const sendNotification = async (
	notification: Omit<Notification, 'posted' | 'id'>,
	db: Kysely<Database>
): Promise<Notification> =>
	db
		.insertInto('notifications')
		.values({ ...notification, posted: new Date() })
		.returningAll()
		.executeTakeFirstOrThrow();
