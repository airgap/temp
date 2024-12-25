import { handleFinalizePost } from '@lyku/handles';
import { AttachmentType, getSupertypeFromAttachmentId } from '@lyku/helpers';
import { Post, User } from '@lyku/json-models/index';

export const finalizePost = handleFinalizePost(
	async ({ body, id }, { db, requester }) => {
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

		const protopost: Post = {
			body: body ?? authRes.body,
			id,
			author: requester,
			attachments: [],
			published: new Date(),
			likes: 0n,
			echoes: 0n,
			replies: 0n,
			replyTo: authRes.replyTo,
			echoing: authRes.echoing,
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
			.executeTakeFirst();
		const user = await db
			.selectFrom('users')
			.where('id', '=', requester)
			.executeTakeFirstOrThrow();
		const canSuper = user.lastSuper < Date.now() - 2 * 60 * 60 * 1000;
		await db
			.updateTable('users')
			.set({
				postCount: db.ref('postCount').add(1),
				points: db.ref('points').add(canSuper ? 10 : 2),
				lastSuper: canSuper ? new Date() : db.ref('lastSuper'),
			})
			.where('id', '=', requester)
			.execute();
		console.log('authRes', authRes);
		if (authRes.replyTo)
			await db
				.updateTable('posts')
				.set({
					replies: db.ref('replies').add(1),
				})
				.where('id', '=', authRes.replyTo)
				.execute();
		if (authRes.echoing)
			await db
				.updateTable('posts')
				.set({
					echoes: db.ref('echoes').add(1),
				})
				.where('id', '=', authRes.echoing)
				.execute();
		return {
			// attachmentUploadPacks: atAts,
			post: p,
		};
	}
);
