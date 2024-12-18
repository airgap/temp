export const getPostIdFromAttachmentId = (attachmentId: bigint) =>
	attachmentId >> 16n;
