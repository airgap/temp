// import type { PageLoad } from 'svelte';
import { api } from 'monolith-ts-api';
import { base58ToBigint } from '@lyku/helpers';

export const load = async ({ params }: any) => {
    const postId = params.post;
    console.log('params', params);
    console.log('postId', postId);
    const big = base58ToBigint(postId);
    console.log('big', big);
    try {
        const post = await api.getPost(big) as any;
        console.log('got post!', (post.body))
        return {
            post
        };
    } catch (error) {
        console.log('Failed to get post', error);
        return {
            post: null,
            error: error instanceof Error ? error.message : 'Failed to load post'
        };
    }
}; 