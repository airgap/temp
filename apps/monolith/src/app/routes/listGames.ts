import { useContract } from '../Contract';
import { Sequence, Table } from 'rethinkdb';
import { FromSchema } from 'from-schema';
import { game, monolith } from 'models';

export const listGames = useContract(
	monolith.listGames,
	async ({ internal, hint, developer, publisher }, { tables, connection }) => {
		let query:
			| Table<FromSchema<typeof game>>
			| Sequence<FromSchema<typeof game>> = tables.games;
		if (internal)
			query = query.getAll(true, {
				index: 'internal',
			});
		if (developer) query = query.filter<false>({ developer });
		if (publisher) query = query.filter<false>({ publisher });
		if (hint)
			query = query.filter<true>((doc) =>
				doc('title').downcase().contains(hint)
			);
		const games = await query.coerceTo('array').run(connection);
		return games;
	}
);
