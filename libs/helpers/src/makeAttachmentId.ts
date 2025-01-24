export const makeAttachmentId = (
	postId: bigint,
	orderNum: number,
	supertype: number,
) => {
	if (orderNum > 255 || orderNum < 0)
		throw new Error('Order number must be 0-255');
	if (supertype > 255 || supertype < 0)
		throw new Error('Supertype must be 0-255');
	return (postId << 16n) | BigInt(orderNum << 8) | BigInt(supertype);
};
