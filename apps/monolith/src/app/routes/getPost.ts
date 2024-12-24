import { useContract } from '../Contract';
import { monolith } from 'models';

export const getPost = useContract(
	monolith.getPost,
	async (id, { tables, connection }) => tables.posts.get(id).run(connection)
);
