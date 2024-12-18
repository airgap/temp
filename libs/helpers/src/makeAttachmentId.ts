export const makeAttachmentId = (
	postId: bigint,
	orderNum: bigint,
	supertype: bigint,
) => {
	if (orderNum > 255n || orderNum < 0n)
		throw new Error('Order number must be 0-255');
	if (supertype > 255n || supertype < 0n)
		throw new Error('Supertype must be 0-255');
	return (postId << 16n) | (orderNum << 8n) | supertype;
};
