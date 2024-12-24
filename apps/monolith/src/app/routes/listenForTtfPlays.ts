import { monolith } from 'models';
import { useContract } from '../Contract';
import { feedSocket } from '../../feedSocket';

export const listenForTtfPlays = useContract(
	monolith.listenForTtfPlays,
	(id, { tables, connection }, { socket }) =>
		feedSocket(socket, tables.ttfMatches.get(id), connection, {
			includeInitial: true,
		})
);
