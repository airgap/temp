import { handleGetPost } from '@lyku/handles';

export const getPost = handleGetPost((id, { db }) =>
	db.selectFrom('posts').selectAll().where('id', '=', id).executeTakeFirst()
);
