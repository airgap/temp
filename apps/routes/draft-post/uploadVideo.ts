import Mux from '@mux/mux-node';
import { VideoDraft } from '@lyku/json-models';
import { AttachmentInitializer } from './AttachmentInitializer';
import { makeAttachmentId, AttachmentType } from '@lyku/helpers';
import { cfAccountId, cfApiToken } from '@lyku/route-helpers';
import { client as mux } from '@lyku/mux-client';
import { FileDraft } from '@lyku/json-models';

export const uploadVideo: AttachmentInitializer<FileDraft> = async ({
	creator,
	post,
	size,
	type,
	orderNum,
}): Promise<VideoDraft> => {
	const id = makeAttachmentId(post, orderNum, AttachmentType.Video);
	console.log('Made video attachment ID', id, id.toString());

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
	console.log('MUX VIDEO');
	return {
		id,
		uploadURL,
		creator,
		post,
		created: new Date(),
		type,
		host: 'mux',
	};
};
