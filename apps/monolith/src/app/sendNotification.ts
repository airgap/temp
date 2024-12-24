import { now } from 'rethinkdb';
import { HardenedState } from './types/State';
import { Notification } from 'models';

export const sendNotification = async (
	notification: Omit<Notification, 'posted' | 'id'>,
	{ tables, connection }: HardenedState
): Promise<Notification> =>
	tables.notifications
		.insert(
			{ ...notification, posted: now() },
			{ returnChanges: true }
		)('changes')(0)('new_val')
		.run(connection);
