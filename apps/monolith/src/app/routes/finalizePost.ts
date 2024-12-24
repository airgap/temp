import { Ex, now } from 'rethinkdb';

import { post, user, monolith, Attachment } from 'models';

import { useContract } from '../Contract';
import { FromSchema } from 'from-schema';

export const finalizePost = useContract(
	monolith.finalizePost,
	async ({ body, id }, { tables, connection }, { userId }) => {
		const draft = tables.postDrafts.get(id);
		const authRes = await draft
			.and(draft('authorId').eq(userId))
			.branch(draft, false)
			.run(connection);

		console.log('ViewPost finalization authorized', authRes);

		if (typeof authRes === 'boolean') throw 404;

		const protopost: FromSchema<typeof post> = {
			body: body ?? authRes.body,
			shortcode: authRes.shortcode,
			// title: authRes.title,
			id,
			authorId: userId,
			attachments: [],
			published: now() as unknown as string,
			likes: 0,
			echoes: 0,
			replies: 0,
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
		// if(authRes.attachments?.length) {
		//   const auths =
		// }
		//
		if (authRes.attachments?.length) {
			for (const element of authRes.attachments) {
				const { supertype, id } = element;
				if (supertype === 'video' || supertype === 'image') {
					console.log('id', id, 'type', supertype);
					// const res = await directUpload(userId, authRes.postId, type, strings);
					// if ('error' in res) return res;
					// atAts.push(res);
				}
			}
			const imageRefs = authRes.attachments
				.filter(({ supertype }) => supertype === 'image')
				.map((a) => a.id);
			const videoRefs = authRes.attachments
				.filter(({ supertype }) => supertype === 'video')
				.map((a) => a.id);
			const images = imageRefs.length
				? await tables.images
						.getAll(...imageRefs)
						.coerceTo('array')
						.run(connection)
				: [];
			const videos = videoRefs.length
				? await tables.videos
						.getAll(...videoRefs)
						.coerceTo('array')
						.run(connection)
				: [];
			const attachments = authRes.attachments.map((att) =>
				(({ image: images, video: videos }[att.supertype] as Attachment[]).find(
					({ id }) => id === att.id
				))
			);
			console.log('Attachment draft status', attachments);
			protopost.attachments = attachments as Attachment[];
		}
		console.log('post', protopost);
		const p = await tables.posts
			.insert(protopost, {
				returnChanges: true,
			})('changes')(0)('new_val')
			.run(connection);
		const canSuper = (u: Ex<FromSchema<typeof user>>) =>
			now()
				.sub(u('lastSuper').default(0))
				.gt(2 * 60 * 60);
		const upd = await tables.users
			.get(userId)
			.update((u: Ex<FromSchema<typeof user>>) => ({
				postCount: u('postCount').default(0).add(1),
				points: u('points').default(0).add(canSuper(u).branch(10, 2)),
				lastSuper: canSuper(u).branch(now(), u('lastSuper')),
			}))
			.run(connection);
		console.log('upd', upd);
		console.log('authRes', authRes);
		if (authRes.replyTo)
			await tables.posts
				.get(authRes.replyTo)
				.update((row) => ({ replies: row('replies').add(1) }))
				.run(connection);
		else if (authRes.echoing)
			await tables.posts
				.get(authRes.echoing)
				.update((row) => ({ echoes: row('echoes').add(1) }))
				.run(connection);
		return {
			// attachmentUploadPacks: atAts,
			post: p,
		};
	}
);
