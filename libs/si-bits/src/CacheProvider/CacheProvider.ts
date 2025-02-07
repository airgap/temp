// CacheProvider.ts
import { api } from 'monolith-ts-api';
import type {
	Document,
	AudioDoc,
	CloudflareVideoDoc,
	Group,
	GroupMembership,
	ImageDoc,
	Like,
	Post,
	User,
	LikeState,
} from '@lyku/json-models';

type CacheConfig<T extends Record<string, any>, K extends keyof T> = {
	get?: (id: T[K]) => Promise<T>;
	getAll: (ids: T[K][]) => Promise<T[]>;
	listen?: (ids: T[K][]) => {
		listen: (cb: (val: T) => void) => void;
		close: () => void;
	};
	key: K;
};

const cacheConfigMap = {
	images: {
		get: api.getImage,
		getAll: api.getImages,
		key: 'id',
	} as const satisfies CacheConfig<ImageDoc, 'id'>,

	videos: {
		get: api.getVideo,
		getAll: api.getVideos,
		key: 'id',
	} as const satisfies CacheConfig<CloudflareVideoDoc, 'id'>,

	audios: {
		get: api.getAudio,
		getAll: api.getAudios,
		key: 'id',
	} as const satisfies CacheConfig<AudioDoc, 'id'>,

	documents: {
		get: api.getDocument,
		getAll: api.getDocuments,
		key: 'id',
	} as const satisfies CacheConfig<Document, 'id'>,

	posts: {
		get: api.getPost,
		getAll: api.getPosts,
		listen: api.listenToPosts,
		key: 'id',
	} as const satisfies CacheConfig<Post, 'id'>,

	users: {
		get: api.getUser,
		getAll: api.getUsers,
		listen: api.listenToUsers,
		key: 'id',
	} as const satisfies CacheConfig<User, 'id'>,

	myLikes: {
		getAll: api.getMyLikes,
		listen: api.listenToMyLikes,
		key: 'id',
	} as const satisfies CacheConfig<LikeState, 'id'>,

	groups: {
		getAll: api.getGroups,
		key: 'id',
	} as const satisfies CacheConfig<Group, 'id'>,

	groupMemberships: {
		getAll: api.getGroupMemberships,
		key: 'id',
	} as const satisfies CacheConfig<GroupMembership, 'id'>,
} as const;

type CacheConfigs = typeof cacheConfigMap;
type DocOfModel<T extends CacheConfig<any, any>> = T extends CacheConfig<
	infer G,
	infer K
>
	? G
	: never;

function createCacheStore() {
	// Create state objects for caches, loading states, and errors
	const caches = $state(
		Object.keys(cacheConfigMap).reduce((acc: any, key) => {
			acc[key as keyof CacheConfigs] = new Map();
			return acc;
		}, {} as { [K in keyof CacheConfigs]: Map<DocOfModel<CacheConfigs[K]>[CacheConfigs[K]['key']], DocOfModel<CacheConfigs[K]>> })
	);

	const loading = $state(new Set<string>());
	const errors = $state(new Map<string, string>());

	function createModelActions<ModelName extends keyof CacheConfigs>(
		modelName: ModelName,
		config: CacheConfigs[ModelName]
	) {
		const cache = caches[modelName];

		async function fetch(
			id: DocOfModel<CacheConfigs[ModelName]>[CacheConfigs[ModelName]['key']]
		): Promise<DocOfModel<CacheConfigs[ModelName]> | undefined> {
			if (cache.has(id)) {
				return cache.get(id);
			}

			const cacheKey = `${modelName}:${id}`;
			if (loading.has(cacheKey)) return;

			loading.add(cacheKey);
			try {
				const [doc] = await config.getAll([id as any]);
				if (doc) {
					cache.set(id, doc);
				}
				return doc as DocOfModel<CacheConfigs[ModelName]> | undefined;
			} catch (error) {
				console.error(`Error fetching ${modelName}:`, error);
				errors.set(cacheKey, String(error));
				return undefined;
			} finally {
				loading.delete(cacheKey);
			}
		}

		async function fetchAll(
			ids: DocOfModel<CacheConfigs[ModelName]>[CacheConfigs[ModelName]['key']][]
		): Promise<(DocOfModel<CacheConfigs[ModelName]> | undefined)[]> {
			const missingIds = ids.filter((id) => !cache.has(id));

			if (missingIds.length === 0) {
				return ids.map((id) => cache.get(id));
			}

			const cacheKey = `${modelName}:batch:${missingIds.join(',')}`;
			if (loading.has(cacheKey)) {
				return ids.map((id) => cache.get(id));
			}

			loading.add(cacheKey);
			try {
				const docs = await config.getAll(missingIds as any[]);
				docs.forEach((doc) => {
					cache.set(doc.id, doc);
				});
				return ids.map((id) => cache.get(id));
			} catch (error) {
				console.error(`Error fetching ${modelName} batch:`, error);
				errors.set(cacheKey, String(error));
				return ids.map((id) => cache.get(id));
			} finally {
				loading.delete(cacheKey);
			}
		}

		function setupListener(
			ids: DocOfModel<CacheConfigs[ModelName]>[CacheConfigs[ModelName]['key']][]
		) {
			if (!('listen' in config)) return;

			const listener = config.listen(ids as any[]);
			listener.listen((val) => {
				cache.set(val.id, val);
			});

			return listener.close;
		}

		return {
			fetch,
			fetchAll,
			setupListener,
			update: (item: DocOfModel<CacheConfigs[ModelName]>) => {
				cache.set(item.id, item);
			},
			remove: (id: DocOfModel<CacheConfigs[ModelName]>['id']) => {
				cache.delete(id);
			},
		};
	}

	// Create actions for each model
	const actions = Object.entries(cacheConfigMap).reduce(
		(acc, [key, config]) => ({
			...acc,
			[key]: createModelActions(key as keyof CacheConfigs, config),
		}),
		{} as {
			[K in keyof CacheConfigs]: ReturnType<typeof createModelActions<K>>;
		}
	);

	return {
		...actions,
		getLoadingState: (key: string) => loading.has(key),
		getError: (key: string) => errors.get(key),
		clearError: (key: string) => errors.delete(key),
		caches,
	};
}

export const cacheStore = createCacheStore();

// Helper types for use in components
export type CacheStore = typeof cacheStore;
export type ModelKeys = keyof CacheConfigs;
export type ModelDoc<K extends ModelKeys> = DocOfModel<CacheConfigs[K]>;
