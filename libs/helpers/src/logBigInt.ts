export const logBigInt = (value: bigint): number => {
	if (value <= 0n) {
		throw new Error('Value must be a positive bigint');
	}
	return Math.log(Number(value));
};
