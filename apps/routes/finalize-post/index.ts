import { handleFinalizePost } from '@lyku/handles';
import { AttachmentType, getSupertypeFromAttachmentId } from '@lyku/helpers';
import { InsertablePost, User } from '@lyku/json-models/index';
import { sql } from 'kysely';
import { elasticate } from './elasticate';

export default handleFinalizePost(async ({ body, id }, { db, requester }) => {
	const authRes = await db
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

	// const insertablePost = Object.fromEntries(
	// 	Object.entries(protopost).filter(
	// 		([s, f]) => typeof f !== 'undefined'
	// 	)
	// ) as Partial<FromSchema<typeof post>>;
	for (const thing of Object.keys(protopost) as (keyof typeof protopost)[])
		if (typeof protopost[thing] === 'undefined') delete protopost[thing];
	console.log('post', protopost);
	const p = await db
		.insertInto('posts')
		.values(protopost)
		.returningAll()
		.executeTakeFirstOrThrow();
	const user = await db
		.selectFrom('users')
		.selectAll()
		.where('id', '=', requester)
		.executeTakeFirstOrThrow();
	const canSuper = user.lastSuper < new Date(Date.now() - 2 * 60 * 60 * 1000);
	await db
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
		await db
			.updateTable('posts')
			.set({
				replies: sql`replies + 1`,
			})
			.where('id', '=', authRes.replyTo)
			.execute();
	if (authRes.echoing)
		await db
			.updateTable('posts')
			.set({
				echoes: sql`echoes + 1`,
			})
			.where('id', '=', authRes.echoing)
			.execute();
	await elasticate(p);
	return p;
});
