/**
 * Utility functions for handling BigInt serialization and deserialization
 */

import type { User } from '@lyku/json-models';
import { decode, encode } from '@msgpack/msgpack';

export type BigintPropsAsStrings<
	T extends Record<string, any> = Record<string, any>,
> = {
	[K in keyof T]: T[K] extends bigint
		? string
		: T[K] extends Date
			? string
			: T[K] extends Array<bigint>
				? Array<string>
				: T[K] extends object
					? BigintPropsAsStrings<T[K]>
					: T[K];
};

export type Serialized<T extends any> = T extends object
	? Record<string, Serialized<keyof T>>
	: T extends Array<infer I>
		? Array<Serialized<I>>
		: T extends bigint
			? string
			: T extends number
				? number
				: T extends string
					? string
					: T extends Date
						? string
						: never;

export const u2s = (u: Uint8Array): string => {
	const decoder = new TextDecoder('utf-8');
	return decoder.decode(u);
};

export const s2u = (s: string): Uint8Array => {
	const encoder = new TextEncoder();
	return encoder.encode(s);
};

export const serialize = (s: unknown) => {
	const b = u2s(encode(s, { useBigInt64: true }));
	return b;
};

export const deserialize = (s: string) => {
	return decode(s2u(s), { useBigInt64: true });
};
