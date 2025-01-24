import {
	useState,
	useEffect,
	useSyncExternalStore,
	useRef,
	useMemo,
} from 'react';
import { api } from 'monolith-ts-api';
import {
	Document,
	AudioDoc,
	CloudflareVideoDoc,
	Group,
	GroupMembership,
	ImageDoc,
	Like,
	Post,
	User,
} from '@lyku/json-models';
import { LikeState } from '@lyku/json-models';

type CacheConfig<T extends { id: any }> = {
	// items: DocMap<T>
	get?: (id: T['id']) => Promise<T>;
	getAll: (ids: T['id'][]) => Promise<T[]>;
	listen?: (ids: T['id'][]) => {
		listen: (cb: (val: T) => void) => void;
		close: () => void;
	};
};

const images = {
	get: api.getImage,
	getAll: api.getImages,
	// listen: api.listenToImages,
} as const satisfies CacheConfig<ImageDoc>;

const videos = {
	get: api.getVideo,
	getAll: api.getVideos,
	// listen: api.listenToVideos,
} as const satisfies CacheConfig<CloudflareVideoDoc>;

const audios = {
	get: api.getAudio,
	getAll: api.getAudios,
} as const satisfies CacheConfig<AudioDoc>;

const documents = {
	get: api.getDocument,
	getAll: api.getDocuments,
} as const satisfies CacheConfig<Document>;

const posts = {
	get: api.getPost,
	getAll: api.getPosts,
	listen: api.listenToPosts,
} as const satisfies CacheConfig<Post>;

const users = {
	get: api.getUser,
	getAll: api.getUsers,
	listen: api.listenToUsers,
} as const satisfies CacheConfig<User>;

// const likes = {
//   get: api.getLike,
//   getAll: api.getLikes,
//   listen: api.listenToLikes,
// } as const satisfies CacheConfig<Like>;

const myLikes = {
	getAll: api.getMyLikes,
	listen: api.listenToMyLikes,
} as const satisfies CacheConfig<LikeState>;
const groups = {
	getAll: api.getGroups,
} as const satisfies CacheConfig<Group>;
const groupMemberships = {
	getAll: api.getGroupMemberships,
} as const satisfies CacheConfig<GroupMembership>;
type CacheConfigMap = Record<string, CacheConfig<any>>;
const cacheConfigMap = {
	images,
	videos,
	audios,
	documents,
	users,
	posts,
	// likes,
	groups,
	groupMemberships,
	myLikes,
} as const satisfies CacheConfigMap;

type DocOfModel<T extends CacheConfig<any>> =
	T extends CacheConfig<infer G> ? G : never;

type DocMapOfCacheConfig<T extends CacheConfig<any>> = Map<
	DocOfModel<T>['id'],
	DocOfModel<T>
>;

type CacheConfigs = typeof cacheConfigMap;

type Cache = {
	readonly [key in keyof CacheConfigs]: {
		items: DocMapOfCacheConfig<CacheConfigs[key]>;
		fetch: (
			id: DocOfModel<CacheConfigs[key]>['id'],
		) => Promise<DocOfModel<CacheConfigs[key]> | undefined>;
		fetchAll: (
			ids: DocOfModel<CacheConfigs[key]>['id'][],
		) => Promise<(DocOfModel<CacheConfigs[key]> | undefined)[]>;
		update: (item: DocOfModel<CacheConfigs[key]>) => void;
		remove: (id: DocOfModel<CacheConfigs[key]>['id']) => void;
	};
};

const createCacheStore = () => {
	const cache = (Object.keys(cacheConfigMap) as (keyof Cache)[]).reduce(
		(acc, k) => ({
			...acc,
			[k]: { items: new Map() },
		}),
		{} as Cache,
	);

	const createFetchMethods = <M extends keyof CacheConfigs>(model: M) => ({
		fetch: async (id: DocOfModel<CacheConfigs[M]>['id']) => {
			const item = cache[model].items.get(id);
			if (item) {
				return item as DocOfModel<CacheConfigs[M]>;
			}

			try {
				const [doc] = await cacheConfigMap[model].getAll([id as any]);
				console.log('got doc', doc);
				cache[model].items.set(id, doc as DocOfModel<CacheConfigs[M]>);
				notify();
				return doc as DocOfModel<CacheConfigs[M]>;
			} catch (error) {
				console.error('Error fetching doc:', error);
				return undefined;
			}
		},
		fetchAll: async (ids: DocOfModel<CacheConfigs[M]>['id'][]) => {
			const missingIds = ids.filter((id) => !cache[model].items.has(id));

			if (missingIds.length === 0) {
				return ids.map(
					(id) =>
						cache[model].items.get(id) as
							| DocOfModel<CacheConfigs[M]>
							| undefined,
				);
			}

			try {
				const docs = await cacheConfigMap[model].getAll(missingIds as any[]);
				docs.forEach((doc: any) => {
					cache[model].items.set(
						doc.id as DocOfModel<CacheConfigs[M]>['id'],
						doc as DocOfModel<CacheConfigs[M]>,
					);
				});
				notify();
				return ids.map(
					(id) =>
						cache[model].items.get(id) as
							| DocOfModel<CacheConfigs[M]>
							| undefined,
				);
			} catch (error) {
				console.error('Error fetching docs:', error);
				return ids.map(
					(id) =>
						cache[model].items.get(id) as
							| DocOfModel<CacheConfigs[M]>
							| undefined,
				);
			}
		},
		update: (item: DocOfModel<CacheConfigs[M]>) => {
			cache[model].items.set(item.id, item);
			notify();
		},
		remove: (id: DocOfModel<CacheConfigs[M]>['id']) => {
			cache[model].items.delete(id);
			notify();
		},
	});

	const cacheWithMethods: Cache = (
		Object.keys(cacheConfigMap) as (keyof Cache)[]
	).reduce(
		(acc, k) => ({
			...acc,
			[k]: { ...cache[k], ...createFetchMethods(k) },
		}),
		{} as Cache,
	);

	const listeners = new Set<() => void>();

	const subscribe = (listener: () => void) => {
		listeners.add(listener);
		return () => {
			listeners.delete(listener);
		};
	};

	const notify = () => {
		listeners.forEach((listener) => listener());
	};

	return {
		cache: cacheWithMethods,
		subscribe,
		notify,
	};
};

const cacheStore = createCacheStore();

export function useCacheSingleton<M extends keyof CacheConfigs>(
	model: M,
	id: DocOfModel<CacheConfigs[M]>['id'] | undefined,
) {
	const { items } = cacheStore.cache[model];
	const cache = useSyncExternalStore(cacheStore.subscribe, () =>
		id ? items.get(id) : undefined,
	);
	console.log('cacheStore', cacheStore);

	const isFetchingRef = useRef(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string>();

	useEffect(() => {
		const fetchData = async () => {
			console.log('cache', cache, 'isFetchingRef', isFetchingRef.current);
			if (id && !cache && !isFetchingRef.current) {
				isFetchingRef.current = true;
				setLoading(true);
				try {
					await cacheStore.cache[model].fetch(
						id as DocOfModel<CacheConfigs[M]>['id'],
					);
				} catch (err) {
					setError(String(err));
				}
				isFetchingRef.current = false;
				setLoading(false);
			}
		};

		void fetchData();
	}, [model, id, cache]);

	return [cache, { loading, error }] as const;
}

export function useCacheData<M extends keyof CacheConfigs>(
	model: M,
	ids: (DocOfModel<CacheConfigs[M]>['id'] | undefined)[],
) {
	const snapshot = useMemo(
		() =>
			(ids.filter((id) => id) as DocOfModel<CacheConfigs[M]>['id'][]).map(
				(id) => cacheStore.cache[model].items.get(id),
			),
		[ids, model],
	);
	const cache = useSyncExternalStore(cacheStore.subscribe, () => snapshot);
	console.log('cacheStore', cacheStore);

	const isFetchingRef = useRef(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string>();

	useEffect(() => {
		const fetchData = async () => {
			if (cache.some((item) => !item) && !isFetchingRef.current) {
				isFetchingRef.current = true;
				setLoading(true);
				try {
					await cacheStore.cache[model].fetchAll(
						ids.filter((id) => id) as DocOfModel<CacheConfigs[M]>['id'][],
					);
				} catch (err) {
					setError(String(err));
				}
				isFetchingRef.current = false;
				setLoading(false);
			}
		};

		void fetchData();
	}, [model, ids, cache, snapshot]);

	return [
		cache as
			| Awaited<ReturnType<(typeof cacheConfigMap)[M]['getAll']>>
			| undefined,
		{ loading, error },
	] as const;
}

export { cacheStore };
