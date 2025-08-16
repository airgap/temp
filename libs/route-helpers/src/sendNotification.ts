import type { Notification } from '@lyku/json-models';
import type { Kysely } from 'kysely';
import type { Database } from '@lyku/db-types';
import { client as nats } from '@lyku/nats-client';
import { pack } from 'msgpackr';

export const sendNotification = async (
	notification: Omit<Notification, 'posted' | 'id'>,
	db: Kysely<Database>,
): Promise<Notification> => {
	// Save notification to database
	const savedNotification = await db
		.insertInto('notifications')
		.values(notification as Notification)
		.returningAll()
		.executeTakeFirstOrThrow();

	// Publish notification to NATS for real-time delivery
	try {
		const subject = `notifications.${notification.user}`;
		const message = pack(savedNotification);
		nats.publish(subject, Uint8Array.from(message));
		console.log(`Published notification to NATS: ${subject}`);
	} catch (error) {
		console.error('Failed to publish notification to NATS:', error);
		// Don't throw - notification is saved in DB even if NATS fails
	}

	return savedNotification;
};
