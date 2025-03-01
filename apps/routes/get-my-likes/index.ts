import { bindIds } from '@lyku/helpers';
import { handleGetMyLikes } from '@lyku/handles';

export default handleGetMyLikes(async (ids, { db, requester }) => {
	const likes = await db
		.selectFrom('likes')
		.selectAll()
		.where(
			'id',
			'in',
			ids.map((id) => bindIds(requester, id)),
		)
		.execute();
	const map = likes.reduce((o, l) => {
		o.set(l.postId, true);
		return o;
	}, new Map<bigint, boolean>());
	return ids.map((id) => ({ id, liked: map.has(id) }));
});
