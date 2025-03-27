export const patchAttachments = <T extends { attachments: string[] }>(
	input: T,
): Omit<T, 'attachments'> & { attachments: bigint[] } => ({
	...input,
	attachments: input.attachments.map((a) => BigInt(a)),
});
