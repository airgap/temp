/**
 * Converts a base58 string back to a bigint
 * @param str The base58 encoded string
 * @returns The decoded bigint value
 * @throws Error if the input string contains characters not in the Base58 alphabet
 */
export function base58ToBigint(str: string): bigint {
	// Base58 alphabet: Bitcoin uses this alphabet (no 0, O, I, l to avoid confusion)
	const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

	// Create a map for faster lookups
	const ALPHABET_MAP: Record<string, number> = {};
	for (let i = 0; i < ALPHABET.length; i++) {
		ALPHABET_MAP[ALPHABET[i]] = i;
	}

	// Handle empty string
	if (str.length === 0) {
		return 0n;
	}

	let value = 0n;

	// Process each character
	for (let i = 0; i < str.length; i++) {
		const char = str[i];
		const charValue = ALPHABET_MAP[char];

		// Validate the character
		if (charValue === undefined) {
			throw new Error(`Invalid Base58 character: ${char}`);
		}

		// Calculate: value = value * 58 + charValue
		value = value * 58n + BigInt(charValue);
	}

	return value;
}
