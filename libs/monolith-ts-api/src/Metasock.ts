import { decode, encode } from '@msgpack/msgpack';
import { getDocumentCookie } from './getDocumentCookie';
import { TsonStreamHandlerModel } from 'from-schema';

type ListenerOf<Route extends TsonStreamHandlerModel> = (
	ev: Route['response'],
) => void;
type EventMap = {
	open: Event;
	close: CloseEvent;
	message: MessageEvent;
};
type HandlerMap = { [K in keyof EventMap]: ((e: EventMap[K]) => void)[] };
// 						const listeners: Listener[] = [];
export const makeMetasock = <Route extends TsonStreamHandlerModel>(
	route: Route,
	url: URL | string,
	initialData?: unknown,
) => {
	let ws: WebSocket;
	const init = () => {
		console.log('Initializing socket');
		ws?.close();
		ws = new WebSocket(url);
		ws.onmessage = (e) => handlers.message.forEach((f) => f(e));
		ws.onclose = (e) => handlers.close.forEach((f) => f(e));
		ws.onopen = (e) => handlers.open.forEach((f) => f(e));
		Object.assign(ws, {
			listen: (listener: ListenerOf<Route>) => listeners.push(listener) && ws,
		});
		console.log('Socket initialized');
	};
	const handlers: HandlerMap = {
		open: [
			(e) => {
				console.log('cookies', document.cookie);
				const sessionId = getDocumentCookie(document.cookie, 'sessionId');
				console.log('session', sessionId);
				ws.send(
					encode(
						{ auth: `Bearer ${sessionId}`, request: initialData },
						{ useBigInt64: true },
					),
				);
				console.log('Sock open');
			},
		],
		close: [
			(event) => {
				console.log('Sock close', event);
				if (event.code === 1000) {
					console.log('Normal closure');
				} else {
					console.log('Abnormal closure');
					setTimeout(init, 1000);
				}
			},
		],
		message: [
			async (ev) => {
				console.log('Sock message', ev);
				let json: any;
				try {
					if (ev.data instanceof Blob) {
						const arrayBuffer = await ev.data.arrayBuffer();
						const uint8Array = new Uint8Array(arrayBuffer);
						console.log(
							'Blob size:',
							ev.data.size,
							'ArrayBuffer size:',
							arrayBuffer.byteLength,
							'First bytes:',
							uint8Array.slice(0, 10),
						);
						json = decode(uint8Array, {
							useBigInt64: true,
						});
					} else if (ev.data instanceof ArrayBuffer) {
						const uint8Array = new Uint8Array(ev.data);
						console.log(
							'ArrayBuffer size:',
							ev.data.byteLength,
							'First bytes:',
							uint8Array.slice(0, 10),
						);
						json = decode(uint8Array, {
							useBigInt64: true,
						});
					} else {
						console.error('Unexpected data type:', typeof ev.data);
						return;
					}
					console.log('Decoded JSON:', json);
				} catch (error: any) {
					console.error('Failed to decode websocket message:', error);
					console.error('Error details:', error.message, error.stack);
					return;
				}
				if (json?.auth) return;
				for (const listener of listeners) listener(json);
			},
		],
	};
	const listeners: ListenerOf<Route>[] = [];
	init();
	return {
		on: (
			eventName: keyof EventMap,
			handler: (event: EventMap[typeof eventName]) => void,
		) => handlers[eventName].push(handler),
		listen: (handler: ListenerOf<Route>) => listeners.push(handler),
	};
};
