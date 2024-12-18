import { getPositionFromAttachmentId } from './getPositionFromAttachmentId';
import { getPostIdFromAttachmentId } from './getPostIdFromAttachmentId';
import { getSupertypeFromAttachmentId } from './getSupertypeFromAttachmentId';

export const parseAttachmentId = (attachmentId: bigint) => ({
	postId: getPostIdFromAttachmentId(attachmentId),
	position: getPositionFromAttachmentId(attachmentId),
	supertype: getSupertypeFromAttachmentId(attachmentId),
});
