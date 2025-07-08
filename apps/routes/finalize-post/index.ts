import { handleFinalizePost } from '@lyku/handles';
import { InsertablePost, Post } from '@lyku/json-models/index';
import { sql } from 'kysely';
import { elasticatePost } from './elasticatePost';
import { client as pg } from '@lyku/postgres-client';
import { client as redis } from '@lyku/redis-client';
import { client as clickhouse } from '@lyku/clickhouse-client';

export default handleFinalizePost(async ({ body, id }, { requester }) => {
	const authRes = await pg
		.selectFrom('postDrafts')
		.selectAll()
		.where('id', '=', id)
		.where('author', '=', requester)
		.executeTakeFirst();

	if (!authRes) {
		throw 404;
	}

	console.log('ViewPost finalization authorized', authRes);

	const protopost: InsertablePost = {
		...authRes,
		body: body ?? authRes.body,
		id,
		publish: new Date(),
		likes: 0n,
		echoes: 0n,
		replies: 0n,
	};
	const files = authRes.attachments
		? await pg
				.selectFrom('files')
				.selectAll()
				.where('id', 'in', authRes.attachments)
				.execute()
		: [];
	const firstImage = files.find((f) => f.type.startsWith('image/'));
	if (firstImage) {
		protopost.ogImage = firstImage.hostId;
	}

	// const insertablePost = Object.fromEntries(
	// 	Object.entries(protopost).filter(
	// 		([s, f]) => typeof f !== 'undefined'
	// 	)
	// ) as Partial<FromSchema<typeof post>>;
	for (const thing of Object.keys(protopost) as (keyof typeof protopost)[])
		if (typeof protopost[thing] === 'undefined') delete protopost[thing];
	console.log('post', protopost);
	const p = await pg
		.insertInto('posts')
		.values(protopost as Post)
		.returningAll()
		.executeTakeFirstOrThrow();
	const user = await pg
		.selectFrom('users')
		.selectAll()
		.where('id', '=', requester)
		.executeTakeFirstOrThrow();
	const canSuper = user.lastSuper < new Date(Date.now() - 2 * 60 * 60 * 1000);
	await pg
		.updateTable('users')
		.set({
			postCount: sql`${sql.ref('postCount')} + 1`,
			points: sql`${sql.ref('points')} + ${canSuper ? 10 : 2}`,
			lastSuper: canSuper ? new Date() : sql.ref('lastSuper'),
		})
		.where('id', '=', requester)
		.execute();
	console.log('authRes', authRes);
	if (authRes.replyTo)
		await pg
			.updateTable('posts')
			.set({
				replies: sql`replies + 1`,
			})
			.where('id', '=', authRes.replyTo)
			.execute();
	if (authRes.echoing)
		await pg
			.updateTable('posts')
			.set({
				echoes: sql`echoes + 1`,
			})
			.where('id', '=', authRes.echoing)
			.execute();
	await elasticatePost(p);
	const stringId = id.toString();
	await redis.zadd(`user:${requester}:recentPosts`, stringId, stringId);
	// await clickhouse.insert({ table: 'posts', values: [p] });
	return p;
});
