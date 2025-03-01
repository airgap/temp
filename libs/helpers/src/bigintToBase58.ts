export function bigintToBase58(num: bigint): string {
	// Base58 alphabet: Bitcoin uses this alphabet (no 0, O, I, l to avoid confusion)
	const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

	// Handle edge case
	if (num === 0n) {
		return ALPHABET[0];
	}

	let result = '';
	let value = num;

	while (value > 0n) {
		const remainder = Number(value % 58n);
		value = value / 58n;
		result = ALPHABET[remainder] + result;
	}

	return result;
}
