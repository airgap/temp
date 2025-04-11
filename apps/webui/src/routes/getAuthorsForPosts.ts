import type { Database } from '@lyku/db-config/kysely';
import type { Kysely } from 'kysely';
import type { Post, User } from '@lyku/json-models';
import { getDedupedAuthorIds } from './getDedupedAuthorIds';

export const getAuthorsForPosts = (posts: Post[], db: Kysely<Database>) =>
	posts.length
		? db
				.selectFrom('users')
				.where('id', 'in', getDedupedAuthorIds(posts))
				.selectAll()
				.execute()
		: [];
