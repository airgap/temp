export const cfloor = (decimals = 0) => {
	const imprecision = Math.pow(10, decimals);
	return (n: number) => Math.floor(n * imprecision) / imprecision;
};
