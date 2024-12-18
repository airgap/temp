export const getPositionFromAttachmentId = (attachmentId: bigint) =>
	(attachmentId >> 8n) & 0xffn;
