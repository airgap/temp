export const dedupeAuthorIds = (posts: bigint[]) => [...new Set(posts)];
