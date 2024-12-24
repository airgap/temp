import { useContract } from '../Contract';
import { monolith } from 'models';

export const getPosts = useContract(
	monolith.getPosts,
	(ids, { tables, connection }) =>
		tables.posts
			.getAll(...ids)
			.coerceTo('array')
			.run(connection)
);
