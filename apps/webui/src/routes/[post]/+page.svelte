<script lang="ts">
	import { DynamicPost } from '@lyku/si-bits';
    import type { PageData } from './$types';
	import type { Post } from '@lyku/json-models';

    const {data} = $props<{data:{post?: Post, error?: Error}}>();
    const {post, error} = data;
    $effect(()=>console.log('PpPost', post))
</script>

{#if error}
    <p>Error loading post: {error}</p>
{:else if !post}
    <p>Loading post...</p>
{:else}
    <h2>{post.name}</h2>
    <DynamicPost {post} />
{/if}
