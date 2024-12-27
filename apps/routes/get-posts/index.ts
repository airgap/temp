import { handleGetPosts } from '@lyku/handles';

export const getPosts = handleGetPosts(async (ids, { db }) =>
	db.selectFrom('posts').selectAll().where('id', 'in', ids).execute()
);
