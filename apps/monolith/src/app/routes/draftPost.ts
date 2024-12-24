import { CompactedPhrasebook } from 'phrasebooks';
import { uuid } from 'rethinkdb';

import { useContract } from '../Contract';
import { cfAccountId, cfApiToken, dev, webuiDomain } from '../env';
import { flagUnsafeHtml } from '../flagUnsafeHtml';
import { run } from '../run';
import { shortenLink } from '../shortenLink';
import { shortenLinksInBody } from '../shortenLinksInBody';
import { FromSchema } from 'from-schema';
import {
	attachmentDraft,
	imageDraft,
	postDraft,
	videoDraft,
	monolith,
} from 'models';

export const draftPost = useContract(
	monolith.draftPost,
	async (
		{ attachments, body, replyTo, echoing },
		{ tables, connection },
		{ userId: authorId },
		strings
	) => {
		if (!cfApiToken && attachments?.length)
			throw new Error('We forgot to enter our Cloudflare password');
		console.log('YAY YOU PASS');
		const postId = await uuid().run(connection);
		const imageDrafts: FromSchema<typeof imageDraft>[] = [];
		const videoDrafts: FromSchema<typeof videoDraft>[] = [];
		const atAts: FromSchema<typeof attachmentDraft>[] = [];
		// const imageUploads: ImageUpload[] = [];
		const reversion = replyTo ?? echoing;
		if (reversion) await tables.posts.get(reversion).run(connection);
		if (attachments?.length) {
			for (let a = 0; a < attachments.length; a++) {
				console.log('Drafting upload', a, 'of', attachments.length);
				const { type, size } = attachments[a];

				const supertype = type.split('/')[0] as 'image' | 'video';
				const init = {
					authorId,
					postId,
					strings,
					size,
				};

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
				await tables.imageDrafts.insert(imageDrafts).run(connection);
			if (videoDrafts.length)
				await tables.videoDrafts.insert(videoDrafts).run(connection);
			console.log(
				imageDrafts.length,
				'images and',
				videoDrafts.length,
				'videos drafted'
			);
			atAts.push(
				...(imageDrafts as FromSchema<typeof attachmentDraft>[]),
				...(videoDrafts as FromSchema<typeof attachmentDraft>[])
			);
		}
		console.log('atAts', atAts);
		if (body) {
			console.log('body', body);
			if (flagUnsafeHtml(body)) throw 400;
			body = await shortenLinksInBody(body, postId, authorId);
		}
		const webuiPath = `${dev ? 'http' : 'https'}://${webuiDomain}/p/${postId}`;
		console.log('Getting shortlink for this new post');
		const shortlinkRes = await shortenLink({
			url: webuiPath,
			authorId: authorId,
			postId,
		}).catch(console.error);
		console.log('shortcode', shortlinkRes);
		const draft: FromSchema<typeof postDraft> = {
			attachments: atAts,
			authorId: authorId,
			id: postId,
			body,
			...(shortlinkRes
				? {
						shortcode: shortlinkRes.code,
				  }
				: {}),
		};
		if (replyTo) draft.replyTo = replyTo;
		else if (echoing) draft.echoing = echoing;
		console.log('draft', draft);
		await tables.postDrafts.insert(draft).run(connection);
		return {
			attachmentUploadPacks: atAts,
			// userId,
			id: postId,
		};
	}
);
type AttachmentInitializer<Return> = (props: {
	authorId: string;
	postId: string;
	strings: CompactedPhrasebook;
	size?: number;
}) => Promise<Return>;
// Example usage
// const html = '<div><p>Some <b>bold</b> text</p><script>alert("no!");</script></div>';
// const allowed = ['b', 'p'];
//
// console.log(stripHtml(html, allowed)); // Output: <p>Some <b>bold</b> text</p>

const uploadImage: AttachmentInitializer<
	FromSchema<typeof imageDraft>
> = async ({ authorId, postId, strings }) => {
	// Do I need <size>?
	const url = `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/images/v2/direct_upload`;
	const metadata = {
		authorId,
		postId,
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
		postId,
		userId: authorId,
		supertype: 'image',
	};
};

const uploadVideo: AttachmentInitializer<
	FromSchema<typeof videoDraft>
> = async ({
	authorId,
	postId,
	size,
}): Promise<FromSchema<typeof videoDraft>> => {
	const endpoint = `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/stream?direct_user=true`;

	const metadata = {
		authorId,
		postId,
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
		stderr
	);
	const uploadURL = stdout.match(/^location: (https:\/\/upload.+)$/m)?.[1];
	const id = stdout.match(/^stream-media-id: ([a-z0-9]{32})$/m)?.[1];
	console.log('CFRES', id, uploadURL);
	if (!(uploadURL && id)) throw new Error('FUCK');
	console.log('VIDEO VIDEO');
	return {
		id,
		uid: id,
		uploadURL,
		userId: authorId,
		postId,
		supertype: 'video',
	};
};
