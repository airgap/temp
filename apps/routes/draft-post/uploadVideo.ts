import Mux from '@mux/mux-node';
import { VideoDraft } from '@lyku/json-models';
import { AttachmentInitializer } from './AttachmentInitializer';
import { makeAttachmentId, AttachmentType } from '@lyku/helpers';
import { cfAccountId, cfApiToken } from '@lyku/route-helpers';
import { client as mux } from '@lyku/mux-client';

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

	const upload = await mux.video.uploads.create({
		cors_origin: 'https://lyku.org',
		new_asset_settings: {
			playback_policy: ['public'],
			video_quality: 'basic',
			passthrough: id.toString(),
		},
	});

	// Get the upload URL and ID from headers
	const uploadURL = upload.url;
	// const id = response.headers.get('stream-media-id');

	console.log('CFRES', id, uploadURL);
	if (!(uploadURL && id)) throw new Error('500');
	console.log('VIDEO VIDEO');
	return {
		id,
		uploadURL,
		user: author,
		post,
		created: new Date(),
	};
};
