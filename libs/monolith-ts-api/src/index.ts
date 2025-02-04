import {
	FromTsonSchema,
	TsonHandlerModel,
	TsonSchema,
	ObjectTsonSchema,
} from 'from-schema';
// import { FromBsonSchema, ObjectBsonSchema } from 'from-schema';

import { sessionId as sId } from '@lyku/json-models';
import * as monolith from '@lyku/mapi-models';

import { apiHost, local, socketPrefix } from './apiHost';
import { getCookie, setCookie } from './cookies';

export { apiHost };
export const protocol = local ? 'http' : 'https';

import { MonolithTypes } from 'monolith-api-types';
import { decode, encode } from '@msgpack/msgpack';

type ContractName = keyof MonolithTypes;

export * from './cookies';

const onlyKey = (route: ContractName): string | void => {
	const r = monolith[route];
	if (!('request' in r)) return;
	if (!('properties' in r.request)) return;
	const keys = Object.keys(
		r.request.properties // honestly just fuck my life at this point
	);
	if (keys.length === 1) return keys[0];
};

function toQueryString(obj?: Record<string, string>) {
	return obj ? '?' + new URLSearchParams(obj).toString() : '';
}

export const api = Object.fromEntries(
	(Object.entries(monolith) as [ContractName, TsonHandlerModel][]).map(
		([routeName, model]) => {
			type ThisRoute = MonolithTypes[typeof routeName];
			return [
				routeName,
				(
					params: ThisRoute extends { request: TsonSchema }
						? ThisRoute['request']
						: never
				) => {
					const route = monolith[routeName] as TsonHandlerModel;
					const key = onlyKey(routeName as ContractName);
					const data = key ? { [key]: params } : params;
					const body = encode(data);
					const stream = 'stream' in route && route.stream;
					const snakeName = routeName.replace(/([A-Z])/g, '-$1').toLowerCase();
					let path = `//${apiHost}/${snakeName}`;
					if (stream) {
						path += toQueryString(data);
						type Listener = (ev: (typeof route)['response']) => void;
						const listeners: Listener[] = [];
						const ws = new WebSocket(`${socketPrefix}:${path}`);
						ws.onopen = () => ws.send(JSON.stringify({ sessionId }));
						ws.onmessage = (ev) => {
							console.log('ws data', ev.data);
							const json = JSON.parse(ev.data);
							if (json?.auth) return;
							for (const listener of listeners) listener(json);
						};
						return Object.assign(ws, {
							listen: (listener: Listener) => listeners.push(listener) && ws,
						});
					} else
						return fetch(path, {
							method: 'method' in model ? model.method : 'POST',
							...(body ? { body } : {}),
							// credentials: 'include',
							headers: {
								'Content-Type': 'application/x-msgpack',
								...(sessionId ? { Authorization: `Bearer ${sessionId}` } : {}),
							},
						} as RequestInit)
							.then((res) => {
								if (res.status !== 200) console.log('Fetch code:', res.status);
								if (!res.ok) {
									switch (res.status) {
										case 498:
											console.log('Deleting expired token due to 498');
											setCookie('sessionId', '', 0);
											window.location.reload();
									}
									// console.log('getting error text');
									// const text = await res.text();
									// console.log('Got error text', text);
									throw new Error(res.statusText ?? 'No status text in error');
								}
								if (!('response' in route && route.response)) return;
								return typeof route.response === 'object' &&
									'type' in route.response &&
									route.response.type === 'string'
									? res.text()
									: res
											.arrayBuffer()
											.then((buf) => decode(new Uint8Array(buf)));
							})
							.catch((err) => {
								console.log('Err:', err);
								throw err;
							});
				},
			];
		}
	)
) as unknown as {
	[K in keyof MonolithTypes]: 'request' extends keyof MonolithTypes[K]
		? (
				params: 'request' extends keyof MonolithTypes[K]
					? MonolithTypes[K]['request']
					: never
		  ) => AsyncOrThicc<K>
		: () => AsyncOrThicc<K>;
};
export type ThiccSocket<K extends ContractName> = WebSocket & {
	listen: (
		listener: (
			ev: MonolithTypes[K] extends { response: unknown }
				? MonolithTypes[K]['response']
				: never
		) => void
	) => void;
};
export type AsinkResponse<K extends ContractName> = Promise<
	MonolithTypes[K] extends { response: unknown }
		? MonolithTypes[K]['response']
		: never
>;
export type AsyncOrThicc<K extends ContractName> =
	'stream' extends keyof MonolithTypes[K] ? ThiccSocket<K> : AsinkResponse<K>;

export { buildShortlink } from './apiHost';

export let sessionId: FromTsonSchema<typeof sId> | undefined;

export const cookie = getCookie('sessionId');
if (cookie && cookie.length) sessionId = cookie;
console.log('sessionId', sessionId);
