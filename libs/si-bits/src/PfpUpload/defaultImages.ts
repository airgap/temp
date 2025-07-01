import type { ImageUploadReason } from '@lyku/json-models';

import smile from '../smile.png';

export const defaultImages: Partial<Record<ImageUploadReason, string>> = {
	ProfilePicture: smile,
	PostAttachment: '33d9691d-d3cf-49ef-3c85-7b3571dd4e00',
};
