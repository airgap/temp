import { ImageDraft } from '@lyku/json-models';
import { AttachmentInitializer } from './AttachmentInitializer';
import { Err, makeAttachmentId, AttachmentType } from '@lyku/helpers';
import { cfAccountId, cfApiToken } from '@lyku/route-helpers';

export const uploadImage: AttachmentInitializer<ImageDraft> = async ({
	author,
	post,
	strings,
	orderNum,
	filename,
}): Promise<ImageDraft> => {
	const id = makeAttachmentId(post, orderNum, AttachmentType.Image);
	console.log('Uploading image', id);
	const url = `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/images/v2/direct_upload`;
	const metadata = {
		author: author.toString(),
		post: post.toString(),
	};

	const formData = new FormData();
	formData.append('requireSignedURLs', 'false');
	formData.append('id', id);
	console.log('Fudge');
	formData.append('metadata', JSON.stringify(metadata));
	console.log('Budge');
	const response = await Bun.fetch(url, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${cfApiToken}`,
		},
		body: formData,
	});
	console.log('Nudge');
	const cfres = await response.json();
	console.log('CFRES', cfres);
	if (!cfres.success) throw new Err(500, strings.unknownBackendError);
	return {
		...cfres.result,
		id,
		post,
		author,
		reason: 'PostAttachment',
		filename,
		// supertype: 'image',
	};
};
