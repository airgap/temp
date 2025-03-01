import { handleGetPost } from '@lyku/handles';

export default handleGetPost((id, { db }) =>
	db
		.selectFrom('posts')
		.selectAll()
		.where('id', '=', id)
		.executeTakeFirstOrThrow(),
);
