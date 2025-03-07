import { handleGetPosts } from '@lyku/handles';

export default handleGetPosts(async (ids, { db }) =>
	db.selectFrom('posts').selectAll().where('id', 'in', ids).execute()
);
