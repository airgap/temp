import { useContract } from '../Contract';
import { monolith, Uuid } from 'models';
import { bindIds } from 'helpers';

export const getMyLikes = useContract(
	monolith.getMyLikes,
	async (ids, { tables, connection }, { userId }) => {
		const likes = await tables.likes
			.getAll(...ids.map((id) => bindIds(userId, id)))('id')
			.coerceTo('array')
			.run(connection);
		const map = likes.reduce((o, l) => {
			o[l] = true;
			return o;
		}, {} as Record<Uuid, boolean>);
		return ids.map((id) => ({ id, liked: id in map }));
	}
);
