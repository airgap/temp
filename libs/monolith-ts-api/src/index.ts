import type {
	FromTsonSchema,
	TsonHandlerModel,
	TsonSchema,
	ObjectTsonSchema,
} from 'from-schema';
// import { FromBsonSchema, ObjectBsonSchema } from 'from-schema';

import { sessionId as sId } from '@lyku/json-models';
import * as monolith from '@lyku/mapi-models';
export function getDocumentCookie(cookies: string, cname: string) {
	const name = cname + '=';
	const ca = cookies.split(';');
	for (const element of ca) {
		let c = element;
		while (c.charAt(0) === ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) === 0) {
			return c.substring(name.length, c.length);
		}
	}
	return '';
}

import { local, socketPrefix, updateHostname } from './apiHost';

// Platform interface for SSR compatibility
interface Platform {
	browser: boolean;
	hostname: string;
	apiHostname: string;
	cookies: {
		get(name: string): string | undefined;
		set(
			name: string,
			value: string,
			options?: { maxAge?: number; path?: string }
		): void;
	};
	reload?: () => void;
}

const isLocalhost =
	typeof window !== 'undefined'
		? window.location.hostname === 'localhost'
		: false;
const browser = typeof window !== 'undefined';
const hostname = isLocalhost
	? 'localhost'
	: browser
	? window.location.hostname
	: '';
let stupidSessionId: string | undefined;
export const setStupidSessionId = (sessionId?: string) => {
	stupidSessionId = sessionId;
};
export let currentPlatform: Platform = {
	browser,
	hostname,
	apiHostname: 'api.lyku.org', //isLocalhost ? 'localhost:3000' : 'api.' + hostname,
	cookies: {
		get: (name) => {
			if (!browser) return undefined;
			return getDocumentCookie(document.cookie, name);
		},
		set: (name, value, options) => {
			if (typeof window === 'undefined') return;
			const expires = options?.maxAge
				? new Date(Date.now() + options.maxAge * 1000).toUTCString()
				: '';
			document.cookie = `${name}=${value}${
				expires ? `;expires=${expires}` : ''
			};path=${options?.path || '/'}`;
		},
	},
	reload:
		typeof window !== 'undefined' ? () => window.location.reload() : undefined,
};

// Allow applications to provide their own platform implementation
export const setPlatform = (platform: Platform) => {
	currentPlatform = platform;
	updateHostname(platform.hostname);
};

import type { MonolithTypes } from '@lyku/mapi-types';
import { decode, encode } from '@msgpack/msgpack';

type ContractName = keyof MonolithTypes;

const onlyKey = (route: ContractName): string | void => {
	const r = monolith[route];
	if (!('request' in r)) return;
	if (!('properties' in r.request)) return;
	const keys = Object.keys(r.request.properties);
	if (keys.length === 1) return keys[0];
};

function toQueryString(obj?: Record<string, string>) {
	return obj ? '?' + new URLSearchParams(obj).toString() : '';
}

// Cookie adapter interface
interface CookieAdapter {
	get(name: string): string | undefined;
	set?(name: string, value?: string, options?: { expires?: number }): void;
}

// Cookie utility functions that use the platform
export function getCookie(name: string): string {
	return currentPlatform.cookies.get(name) || '';
}

export function setCookie(name: string, value: string, days: number) {
	currentPlatform.cookies.set(name, value, {
		path: '/',
		maxAge: days * 24 * 60 * 60,
	});
}

// Default adapter using platform-aware cookie functions
const defaultAdapter: CookieAdapter = {
	get: getCookie,
	set: (name: string, value: string, options?: { expires?: number }) => {
		setCookie(name, value, options?.expires || 0);
	},
};

export let cookieAdapter: CookieAdapter = defaultAdapter;

// Allow consumers to set their own adapter
export const setCookieAdapter = (adapter: CookieAdapter) => {
	cookieAdapter = adapter;
};

let _sessionId: FromTsonSchema<typeof sId> | undefined;

export const getSessionId = () => {
	return cookieAdapter.get('sessionId') || '';
};

export const initSession = (serverSessionId?: string) => {
	const cookie = getSessionId() || serverSessionId;
	if (cookie && cookie.length) _sessionId = cookie;
	return _sessionId;
};

// Remove immediate initialization - let components handle it
// if (browser) {
//     initSession();
// }

export const getActiveSession = () => _sessionId;

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
					let path = `https://api.lyku.org/${snakeName}`;
					// let path = `//${currentPlatform.apiHostname}/${snakeName}`;

					// Don't create WebSocket connections during SSR
					if (stream && currentPlatform.browser) {
						type Listener = (ev: (typeof route)['response']) => void;
						const listeners: Listener[] = [];
						const ws = new WebSocket(`${socketPrefix}:${path}`);
						ws.onopen = () =>
							ws.send(
								JSON.stringify({ sessionId: cookieAdapter.get('sessionId') })
							);
						ws.onmessage = (ev) => {
							console.log('ws data', ev.data);
							const json = JSON.parse(ev.data);
							if (json?.auth) return;
							for (const listener of listeners) listener(json);
						};
						return Object.assign(ws, {
							listen: (listener: Listener) => listeners.push(listener) && ws,
						});
					} else {
						console.log('fetching', path);
						const bearer = stupidSessionId || cookieAdapter.get('sessionId');
						console.log('bearer', bearer);
						const fetchOptions: RequestInit = {
							method: 'method' in model ? model.method : 'POST',
							// Only include credentials if it's supported in the environment
							...(typeof window !== 'undefined'
								? { credentials: 'include' }
								: {}),
							...(body ? { body } : {}),
							headers: {
								'Content-Type': 'application/x-msgpack',
								...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
							},
						};
						console.log('fetchOptions', fetchOptions);
						return fetch(path, fetchOptions)
							.then((res) => {
								if (res.status !== 200) console.log('Fetch code:', res.status);
								if (!res.ok) {
									switch (res.status) {
										case 498:
											console.log('Deleting expired token due to 498');
											setCookie('sessionId', '', 0);
											currentPlatform.reload?.();
									}
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
					}
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
