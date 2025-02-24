<script lang="ts">
    import { api, getSessionId } from 'monolith-ts-api';
    import { PostList } from '@lyku/si-bits';
    import { getContext } from 'svelte';
    import { page } from '$app/stores';

    // Get groupId from route params instead of window.location
    const groupId = $derived($page.params.slug);
    
    // Get cache from context and derive group data
    const cache: any = getContext('cache');
    const group = $derived($cache?.groups?.[groupId]);

    // Create posts promise based on auth state
    const postsPromise = $derived(
        getSessionId()
            ? api.listFeedPosts({ groups: [BigInt(groupId)] })
            : api.listFeedPostsUnauthenticated({ groups: [BigInt(groupId)]})
    );

    let error = $state<Error | null>(null);
    let loading = $state(true);
    let posts = $state<any[]>([]);

    // Effect to handle promise
    $effect(() => {
        loading = true;
        error = null;
        
        postsPromise
            .then(result => {
                posts = result;
                loading = false;
            })
            .catch(e => {
                error = e;
                loading = false;
            });
    });
</script>

{#if group}
    <h2>{group.name}</h2>
{/if}

{#if loading}
    <p>Loading posts...</p>
{:else if error}
    <p>Error loading posts: {error.message}</p>
{:else}
    <PostList {posts} />
{/if} 