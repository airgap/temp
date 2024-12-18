export const removeKey = <T, K extends keyof T>(o: T, k: K): Omit<T, K> => {
	const copy = { ...o };
	delete copy[k];
	return copy;
};
export const removeKeys = <T extends object, K extends keyof T>(
	o: T,
	...keys: K[]
): Omit<T, K> => {
	return Object.fromEntries(
		Object.entries(o).filter(([key]) => !keys.includes(key as K)),
	) as Omit<T, K>;
};
