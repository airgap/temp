import { monolith } from 'models';
import { useContract } from '../Contract';
import { feedSocket } from '../../feedSocket';

export const listenToPostCount = useContract(
	monolith.listenToPostCount,
	(_, { tables, connection }, { socket }) => {
		void feedSocket(socket, tables.posts.count(), connection, {
			includeInitial: true,
		});
	}
);
