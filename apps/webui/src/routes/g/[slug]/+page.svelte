<script lang="ts">
    import { api, getSessionId } from 'monolith-ts-api';
    import { PostList } from '@lyku/si-bits';
    import { getContext } from 'svelte';

    // Get groupId from URL path
    const groupId = window.location.pathname.split('/g/')?.[1];
    
    // Get cache from context
    const cache: any = getContext('cache');
    $: group = $cache?.groups?.[groupId];

    // Create posts promise
    const postsPromise = getSessionId()
        ? api.listFeedPosts({ groups: [BigInt(groupId)] })
        : api.listFeedPostsUnauthenticated({ groups: [BigInt(groupId)]});
</script>

{#if group}
    <h2>{group.name}</h2>
{/if}

{#await postsPromise}
    <p>Loading posts...</p>
{:then posts}
    <PostList {posts} />
{:catch error}
    <p>Error loading posts: {error.message}</p>
{/await} 