import { imageDraft } from './imageDraft';
import { videoDraft } from './videoDraft';
import {
	FromBsonSchema,
	OneOfBsonSchema,
} from 'from-schema';
export const attachmentDraft = {
	oneOf: [imageDraft, videoDraft],
} as const satisfies OneOfBsonSchema;
export type AttachmentDraft = FromBsonSchema<typeof attachmentDraft>;
// console.log(JSON.stringify(attachmentDraft, null, 2));
