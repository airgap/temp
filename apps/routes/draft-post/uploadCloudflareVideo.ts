import { VideoDraft } from '@lyku/json-models';
import { AttachmentInitializer } from './AttachmentInitializer';
import { makeAttachmentId, AttachmentType } from '@lyku/helpers';
import { cfAccountId, cfApiToken } from '@lyku/route-helpers';

export const uploadVideo: AttachmentInitializer<VideoDraft> = async ({
	author,
	post,
	size,
	orderNum,
}): Promise<VideoDraft> => {
	const id = makeAttachmentId(post, orderNum, AttachmentType.Video);
	const endpoint = `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/stream?direct_user=true`;
	const metadata = {
		author,
		post,
	};

	const response = await Bun.fetch(endpoint, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${cfApiToken}`,
			'Tus-Resumable': '1.0.0',
			'Upload-Metadata': 'maxDurationSeconds NjAw',
			'Upload-Length': size?.toString() ?? '',
		},
		body: (() => {
			const formData = new FormData();
			formData.append('requireSignedURLs', 'false');
			formData.append('metadata', JSON.stringify(metadata));
			formData.append('id', id.toString());
			return formData;
		})(),
	});

	// Get the upload URL and ID from headers
	const uploadURL = response.headers.get('location');
	// const id = response.headers.get('stream-media-id');

	console.log('CFRES', id, uploadURL);
	if (!(uploadURL && id)) throw new Error('500');
	console.log('CLOUDFLARE VIDEO');
	return {
		id,
		uploadURL,
		user: author,
		post,
		created: new Date(),
	};
};
