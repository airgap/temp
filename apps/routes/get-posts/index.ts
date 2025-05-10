import { handleGetPosts } from '@lyku/handles';
import { client as pg } from '@lyku/postgres-client';
export default handleGetPosts(async (ids, {}) =>
	pg.selectFrom('posts').selectAll().where('id', 'in', ids).execute(),
);
