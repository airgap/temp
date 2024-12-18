import { useContract } from '../Contract';
import { monolith } from 'models';
import { sendNotification } from '../sendNotification';

export const testNotification = useContract(
	monolith.testNotification,
	(notification, state, { userId }) =>
		sendNotification({ user: userId, ...notification }, state),
);
