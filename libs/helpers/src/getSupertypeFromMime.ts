import { imageMimeList, videoMimeList, audioMimeList } from '@lyku/defaults';
import { AttachmentType } from './AttachmentType';

const map = Object.fromEntries(
	[imageMimeList, videoMimeList, audioMimeList].flatMap((list, type) =>
		list.map((mime) => [mime, type]),
	),
) satisfies Record<string, AttachmentType>;

export const getSupertypeFromMime = (mime: string) => {
	if (!(mime in map)) throw new Error(`Unknown mime type: ${mime}`);
	return map[mime];
};
