import type { Database } from '@lyku/db-config/kysely';
import type { Kysely } from 'kysely';
import type { Post, User } from '@lyku/json-models';
import { dedupeAuthorIds } from './getDedupedAuthorIds';

export const getAuthors = (authors: bigint[], db: Kysely<Database>) =>
	authors.length
		? db.selectFrom('users').where('id', 'in', authors).selectAll().execute()
		: [];
