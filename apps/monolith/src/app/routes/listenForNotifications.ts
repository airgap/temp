import { monolith } from 'models';
import { useContract } from '../Contract';
import { feedSocket } from '../../feedSocket';

export const listenForNotifications = useContract(
	monolith.listenForNotifications,
	(_, { tables, connection }, { socket, userId }) =>
		feedSocket(
			socket,
			tables.notifications.getAll(userId, { index: 'user' }),
			connection,
		),
);
