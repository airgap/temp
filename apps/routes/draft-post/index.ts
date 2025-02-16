import { CompactedPhrasebook } from '@lyku/phrasebooks';

import {
	cfAccountId,
	cfApiToken,
	dev,
	webuiDomain,
	flagUnsafeHtml,
	run,
	shortenLinksInBody,
} from '@lyku/route-helpers';
import { handleDraftPost } from '@lyku/handles';
import { ImageDraft, PostDraft, VideoDraft } from '@lyku/json-models/index';
import { getSupertypeFromMime, makeAttachmentId } from '@lyku/helpers';

type AttachmentDraft = ImageDraft | VideoDraft;

export default handleDraftPost(
	async (
		{ attachments, body, replyTo, echoing },
		{ db, requester, strings },
	) => {
		if (!cfApiToken && attachments?.length)
			throw new Error('We forgot to enter our Cloudflare password');
		console.log('YAY YOU PASS');
		const imageDrafts: ImageDraft[] = [];
		const videoDrafts: VideoDraft[] = [];
		// const attachmentIds: bigint[] = attachments.map(a => makeAttachmentId(a.type, a.size));
		// const imageUploads: ImageUpload[] = [];
		const reversion = replyTo ?? echoing;
		if (reversion)
			await db
				.selectFrom('posts')
				.where('id', '=', reversion)
				.executeTakeFirst();
		const draft: PostDraft = await db
			.insertInto('postDrafts')
			.values({
				author: requester,
				body,
			})
			.returningAll()
			.executeTakeFirstOrThrow();
		const atAts: AttachmentDraft[] = [];
		const attachmentIds: bigint[] =
			attachments?.map((a, i) =>
				makeAttachmentId(draft.id, i, getSupertypeFromMime(a.type)),
			) ?? [];
		if (attachments?.length) {
			for (let a = 0; a < attachments.length; a++) {
				console.log('Drafting upload', a, 'of', attachments.length);
				const { type, size } = attachments[a];

				const supertype = type.split('/')[0] as 'image' | 'video';
				const init = {
					id: attachmentIds[a],
					author: requester,
					post: draft.id,
					strings,
					size,
				} satisfies AttachmentInitializerProps;

				switch (supertype) {
					case 'image':
						imageDrafts.push(await uploadImage(init));
						break;
					case 'video':
						videoDrafts.push(await uploadVideo(init));
						break;
				}
			}
			if (imageDrafts.length)
				await db.insertInto('imageDrafts').values(imageDrafts).execute();
			if (videoDrafts.length)
				await db.insertInto('videoDrafts').values(videoDrafts).execute();
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
			if (flagUnsafeHtml(body)) throw 400;
			body = await shortenLinksInBody(body, draft.id, requester, db);
		}
		const webuiPath = `${dev ? 'http' : 'https'}://${webuiDomain}/p/${
			draft.id
		}`;
		console.log('Getting shortlink for this new post');
		draft.attachments = attachmentIds;
		if (replyTo) draft.replyTo = replyTo;
		else if (echoing) draft.echoing = echoing;
		console.log('draft', draft);
		await db.insertInto('postDrafts').values(draft).execute();
		return {
			attachmentUploadPacks: atAts,
			// userId,
			id: draft.id,
		};
	},
);
type AttachmentInitializerProps = {
	id: bigint;
	author: bigint;
	post: bigint;
	strings: CompactedPhrasebook;
	size?: number;
};
type AttachmentInitializer<Return> = (
	props: AttachmentInitializerProps,
) => Promise<Return>;
// Example usage
// const html = '<div><p>Some <b>bold</b> text</p><script>alert("no!");</script></div>';
// const allowed = ['b', 'p'];
//
// console.log(stripHtml(html, allowed)); // Output: <p>Some <b>bold</b> text</p>

const uploadImage: AttachmentInitializer<ImageDraft> = async ({
	author,
	post,
	strings,
}) => {
	// Do I need <size>?
	const url = `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/images/v2/direct_upload`;
	const metadata = {
		author,
		post,
	};
	const command = `curl --request POST \\
    --url ${url} \\
    --header 'Content-Type: multipart/form-data' \\
    --header 'Authorization: Bearer ${cfApiToken}' \\
    --form 'requireSignedURLs=false' \\
    --form 'metadata=${JSON.stringify(metadata)}'`;
	const { stdout } = await run(command);
	const cfres = JSON.parse(stdout); // as dus['response'];
	console.log('CFRES', cfres);
	if (!cfres.success) throw new Error(strings.unknownBackendError);
	return {
		...cfres.result,
		post,
		author,
		supertype: 'image',
	};
};

const uploadVideo: AttachmentInitializer<VideoDraft> = async ({
	author,
	post,
	size,
}): Promise<VideoDraft> => {
	const endpoint = `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/stream?direct_user=true`;

	const metadata = {
		author,
		post,
	};
	const command = `curl -i --request POST \\
    --url ${endpoint} \\
    --header 'Content-Type: multipart/form-data' \\
    --header 'Authorization: Bearer ${cfApiToken}' \\
    --header 'Tus-Resumable: 1.0.0' \\
    --header 'Upload-Metadata: maxDurationSeconds NjAw' \\
	--header 'Upload-Length: ${size}' \\
    --form 'requireSignedURLs=false' \\
    --form 'metadata=${JSON.stringify(metadata)}'`;
	const { stdout, stderr } = await run(command);
	console.log(
		'stdout',
		stdout.match(/^location: (https:\/\/upload.+)$/m)?.[1],
		'stderr',
		stderr,
	);
	const uploadURL = stdout.match(/^location: (https:\/\/upload.+)$/m)?.[1];
	const id = stdout.match(/^stream-media-id: ([a-z0-9]{32})$/m)?.[1];
	console.log('CFRES', id, uploadURL);
	if (!(uploadURL && id)) throw new Error('500');
	console.log('VIDEO VIDEO');
	return {
		id,
		uid: id,
		uploadURL,
		user: author,
		post,
		created: new Date(),
	};
};
