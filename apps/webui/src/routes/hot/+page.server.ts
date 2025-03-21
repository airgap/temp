// import type { PageLoad } from './$types';
import { api, setFetch } from 'monolith-ts-api';
import { neon } from '../../lib/server/db.server';
import { sql } from 'kysely';

export const load = async ({ params, fetch }: any) => {
	const db = neon();
	const posts = await db
		.selectFrom('posts')
		.selectAll()
		.orderBy(
			sql`(likes / (EXTRACT(EPOCH FROM (NOW() - "publish")) / 3600))`,
			'desc',
		)
		.limit(50)
		.execute();

	const authors = await db
		.selectFrom('users')
		.where('id', 'in', [...new Set(posts.map((p) => p.author))])
		.selectAll()
		.execute();
	return {
		posts,
		users: authors,
	};
};
