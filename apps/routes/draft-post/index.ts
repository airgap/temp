import { CompactedPhrasebook } from '@lyku/phrasebooks';

import {
	cfAccountId,
	cfApiToken,
	dev,
	webuiDomain,
	flagUnsafeHtml,
	shortenLinksInBody,
} from '@lyku/route-helpers';
import { handleDraftPost } from '@lyku/handles';
import { client as pg } from '@lyku/postgres-client';
import {
	ImageDraft,
	PostDraft,
	VideoDraft,
	InsertablePostDraft,
} from '@lyku/json-models/index';
import {
	Err,
	getSupertypeFromMime,
	makeAttachmentId,
} from '@lyku/helpers';
import { AttachmentInitializerProps } from './AttachmentInitializer';
import { uploadImage } from './uploadImage';
import { uploadVideo } from './uploadVideo';

type AttachmentDraft = ImageDraft | VideoDraft;

export default handleDraftPost(
	async (
		{ attachments, body, replyTo, echoing },
		{ requester, strings },
	) => {
		console.log('Drafting post', requester, body, replyTo, echoing);
		console.log('id', cfAccountId, 'token', cfApiToken);
		if (!cfApiToken && attachments?.length)
			throw new Err(500, 'We forgot to enter our Cloudflare password');
		console.log('YAY we entered our cloudflare password');
		const imageDrafts: ImageDraft[] = [];
		const videoDrafts: VideoDraft[] = [];
		// const attachmentIds: bigint[] = attachments.map(a => makeAttachmentId(a.type, a.size));
		// const imageUploads: ImageUpload[] = [];
		const reversion = replyTo ?? echoing;
		if (reversion)
			await pg
				.selectFrom('posts')
				.where('id', '=', reversion)
				.executeTakeFirst();
		const draft: PostDraft = await pg
			.insertInto('postDrafts')
			.values({
				author: requester,
				body,
			} as PostDraft)
			.returningAll()
			.executeTakeFirstOrThrow();
		const atAts: AttachmentDraft[] = [];
		console.log('Mapping attachment ids');
		const attachmentIds: bigint[] =
			attachments?.map((a, i) =>
				makeAttachmentId(draft.id, i, getSupertypeFromMime(a.type)),
			) ?? [];
		console.log('Mapped att ids');
		if (attachments?.length) {
			for (let a = 0; a < attachments.length; a++) {
				console.log('Drafting upload', a, 'of', attachments.length);
				const { type, size, filename } = attachments[a];
				console.log('D1');
				const supertype = type.split('/')[0] as 'image' | 'video';
				const init = {
					id: attachmentIds[a],
					author: requester,
					post: draft.id,
					strings,
					size,
					orderNum: a,
					filename,
				} satisfies AttachmentInitializerProps;
				console.log('D2');
				switch (supertype) {
					case 'image':
						console.log('D3A1');
						imageDrafts.push(await uploadImage(init));
						console.log('D3A2');
						break;
					case 'video':
						console.log('D3B1');
						videoDrafts.push(await uploadVideo(init));
						console.log('D3B2');
						break;
				}
				console.log('D4');
			}
			if (imageDrafts.length)
				await pg.insertInto('imageDrafts').values(imageDrafts).execute();
			if (videoDrafts.length)
				await pg.insertInto('videoDrafts').values(videoDrafts).execute();
			console.log(
				imageDrafts.length,
				'images and',
				videoDrafts.length,
				'videos drafted',
			);
			atAts.push(...imageDrafts, ...videoDrafts);
		}
		console.log('atAts', atAts);
		if (body) {
			console.log('body', body);
			if (flagUnsafeHtml(body)) throw new Err(400, 'Invalid HTML detected');
			body = await shortenLinksInBody(body, draft.id, requester, pg);
		}
		const webuiPath = `${dev ? 'http' : 'https'}://${webuiDomain}/p/${
			draft.id
		}`;
		console.log('Getting shortlink for this new post');
		draft.attachments = attachmentIds;
		if (replyTo) draft.replyTo = replyTo;
		else if (echoing) draft.echoing = echoing;
		console.log('draft', draft);
		await pg
			.updateTable('postDrafts')
			.set(draft)
			.where('id', '=', draft.id)
			.execute();
		return {
			imageDrafts,
			videoDrafts,
			// userId,
			id: draft.id,
		};
	},
);
