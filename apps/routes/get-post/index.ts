import { handleGetPost } from '@lyku/handles';
import { Err } from '@lyku/helpers';

export default handleGetPost((id, { db }) =>
	db
		.selectFrom('posts')
		.selectAll()
		.where('id', '=', id)
		.executeTakeFirst()
		.then((p) => {
			if (!p) throw new Err(404);
			return p;
		})
);
