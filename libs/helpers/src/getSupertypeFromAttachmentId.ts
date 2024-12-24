import { AttachmentType } from './AttachmentType';

export const getSupertypeFromAttachmentId = (
	attachmentId: bigint
): AttachmentType => Number(attachmentId & 0xffn);
