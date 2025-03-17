export const onEach = async <T>(
	emitter: AsyncIterable<T>,
	fn: (msg: T) => void,
) => {
	for await (const msg of emitter) fn(msg);
};
