import { handleGetPost } from '@lyku/handles';
import { Err } from '@lyku/helpers';
import { client as pg } from '@lyku/postgres-client';

export default handleGetPost((id, {}) =>
	pg
		.selectFrom('posts')
		.selectAll()
		.where('id', '=', id)
		.executeTakeFirst()
		.then((p) => {
			if (!p) throw new Err(404);
			return p;
		}),
);
