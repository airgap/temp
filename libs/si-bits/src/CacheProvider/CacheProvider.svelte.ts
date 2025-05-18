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

type VectorCacheConfig = {
	get?: (id: bigint) => Promise<bigint>;
	getAll: (ids: bigint[]) => Promise<bigint[]>;
	listen?: (ids: bigint[]) => {
		listen: (cb: (val: bigint) => void) => void;
		close: () => void;
	};
};

type RecordCacheConfig<T extends Record<string, any>, K extends keyof T> = {
	get?: (id: T[K]) => Promise<T>;
	getAll: (ids: T[K][]) => Promise<T[]>;
	listen?: (ids: T[K][]) => {
		listen: (cb: (val: T) => void) => void;
		close: () => void;
	};
	key: K;
};

type CacheConfig = VectorCacheConfig | RecordCacheConfig<any, any>;

const cacheConfigMap = {
	images: {
		get: api.getImage,
		getAll: api.getImages,
		key: 'id',
	} as const satisfies RecordCacheConfig<ImageDoc, 'id'>,

	videos: {
		get: api.getVideo,
		getAll: api.getVideos,
		key: 'id',
	} as const satisfies RecordCacheConfig<CloudflareVideoDoc, 'id'>,

	audios: {
		get: api.getAudio,
		getAll: api.getAudios,
		key: 'id',
	} as const satisfies RecordCacheConfig<AudioDoc, 'id'>,

	documents: {
		get: api.getDocument,
		getAll: api.getDocuments,
		key: 'id',
	} as const satisfies RecordCacheConfig<Document, 'id'>,

	posts: {
		get: api.getPost,
		getAll: api.getPosts,
		listen: api.listenToPosts,
		key: 'id',
	} as const satisfies RecordCacheConfig<Post, 'id'>,

	users: {
		get: api.getUser,
		getAll: api.getUsers,
		listen: api.listenToUsers,
		key: 'id',
	} as const satisfies RecordCacheConfig<User, 'id'>,

	myLikes: {
		getAll: api.getMyLikes,
		listen: api.listenToMyLikes,
	} as const satisfies VectorCacheConfig,

	groups: {
		getAll: api.getGroups,
		key: 'id',
	} as const satisfies RecordCacheConfig<Group, 'id'>,
} as const;

type CacheConfigs = typeof cacheConfigMap;
type DocOfModel<T extends CacheConfig> =
	T extends RecordCacheConfig<infer G, infer K> ? G : bigint;

function createCacheStore() {
	// Create state objects for caches, loading states, and errors
	const caches = $state(
		Object.keys(cacheConfigMap).reduce((acc: any, key) => {
			acc[key as keyof CacheConfigs] = new Map();
			return acc;
		}, {}),
	);

	const loading = $state(new Set<string>());
	const errors = $state(new Map<string, string>());

	function createModelActions<ModelName extends keyof CacheConfigs>(
		modelName: ModelName,
		config: CacheConfigs[ModelName],
	) {
		const cache = caches[modelName];
		const key = 'key' in config ? config.key : undefined;

		async function fetch(
			id: CacheConfigs[ModelName] extends { key: any }
				? DocOfModel<CacheConfigs[ModelName]>[CacheConfigs[ModelName]['key']]
				: bigint,
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
			ids: CacheConfigs[ModelName] extends { key: any }
				? DocOfModel<CacheConfigs[ModelName]>[CacheConfigs[ModelName]['key']][]
				: bigint[],
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
					cache.set(
						typeof doc === 'bigint' ? doc : doc[key as keyof typeof doc],
						doc,
					);
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
			ids: CacheConfigs[ModelName] extends { key: any }
				? DocOfModel<CacheConfigs[ModelName]>[CacheConfigs[ModelName]['key']][]
				: bigint[],
		) {
			if (!('listen' in config)) return;

			const listener = config.listen(ids as any[]);
			listener.listen((val) => {
				cache.set(
					typeof val === 'bigint' ? val : val[key as keyof typeof val],
					val,
				);
			});

			return listener.close;
		}

		return {
			fetch,
			fetchAll,
			setupListener,
			update: (item: DocOfModel<CacheConfigs[ModelName]>) => {
				cache.set(
					typeof item === 'bigint' ? item : item[key as keyof typeof item],
					item,
				);
			},
			remove: (
				id: CacheConfigs[ModelName] extends { key: any }
					? DocOfModel<CacheConfigs[ModelName]>[CacheConfigs[ModelName]['key']]
					: bigint,
			) => {
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
		},
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
