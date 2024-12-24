import { monolith } from 'models';
import { desc } from 'rethinkdb';

import { useContract } from '../Contract';

export const listMessages = useContract(
	monolith.listMessages,
	async (_, { tables, connection }) => {
		const messages = await tables.messages
			.orderBy(desc('r_date'))
			.limit(20)
			.limit(1)
			.coerceTo('array')
			.run(connection);
		return { messages };
	}
);
