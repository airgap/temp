import { bindIds } from '@lyku/helpers';
import { handleGetMyLikes } from '@lyku/handles';
import { client as pg } from '@lyku/postgres-client';
export default handleGetMyLikes(async (ids, { requester }) => {
	const likes = await pg
		.selectFrom('likes')
		.selectAll()
		.where('postId', 'in', ids)
		.where('userId', '=', requester)
		.execute();
	const map = likes.reduce((o, l) => {
		o.set(l.postId, true);
		return o;
	}, new Map<bigint, boolean>());
	return ids.map((id) => (map.has(id) ? id : -id));
});
