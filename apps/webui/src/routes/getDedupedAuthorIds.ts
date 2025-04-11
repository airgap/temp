import type { Post } from '@lyku/json-models';

export const getDedupedAuthorIds = (posts: Post[]) => [
	...new Set(posts.map((post) => post.author)),
];
