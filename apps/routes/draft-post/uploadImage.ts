import { ImageDraft } from '@lyku/json-models';
import { AttachmentInitializer } from './AttachmentInitializer';
import { Err, makeAttachmentId, AttachmentType } from '@lyku/helpers';
import { cfAccountId, cfApiToken } from '@lyku/route-helpers';
import { FileDraft } from '@lyku/json-models';

export const uploadImage: AttachmentInitializer<FileDraft> = async ({
	creator,
	post,
	orderNum,
	filename,
	type,
}): Promise<FileDraft> => {
	const id = makeAttachmentId(post, orderNum, AttachmentType.Image);
	console.log('Uploading image', id);
	const url = `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/images/v2/direct_upload`;
	const metadata = {
		author: creator.toString(),
		post: post.toString(),
	};

	const formData = new FormData();
	formData.append('requireSignedURLs', 'false');
	formData.append('id', id.toString());
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
	if (!cfres.success) throw new Err(500);
	return {
		hostId: cfres.result.id,
		uploadURL: cfres.result.uploadURL,
		id,
		post,
		creator,
		reason: 'PostAttachment',
		filename,
		type,
		host: 'cf',
		supertype: 'image',
	};
};
