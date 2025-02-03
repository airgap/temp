type AddEventListenerSignature = {
	addEventListener(
		type: string,
		listener: EventListenerOrEventListenerObject,
		options?: boolean | AddEventListenerOptions
	): void;
	removeEventListener(
		type: string,
		listener: EventListenerOrEventListenerObject,
		options?: boolean | EventListenerOptions
	): void;
};

type EventMapFromElement<T> = T extends AddEventListenerSignature
	? T extends { addEventListener: infer U }
		? U extends (type: infer K, listener: infer L, options?: infer O) => void
			? K extends string
				? { [key in K]: (this: T, ev: Event) => void }
				: never
			: never
		: never
	: never;

type EventHandler<T> = (
	element: T,
	type: keyof EventMapFromElement<T>,
	listener: EventMapFromElement<T>[keyof EventMapFromElement<T>],
	options?: boolean | EventListenerOptions
) => void;

const eventHandler =
	(
		method: 'addEventListener' | 'removeEventListener'
	): EventHandler<AddEventListenerSignature> =>
	(element, type, listener, options) =>
		element[method](
			type as string,
			listener as EventListenerOrEventListenerObject,
			options
		);

export const bind = eventHandler('addEventListener');
export const unbind = eventHandler('removeEventListener');
