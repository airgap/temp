<script lang="ts">
	import { DynamicPost } from '@lyku/si-bits';
    import type { PageData } from './$types';
	import type { Post, User } from '@lyku/json-models';

    const {data} = $props<{data:{post: Post, author: User}|{error: string}}>();
    const {post, error} = data;
    console.log('data', data)
    $effect(()=>console.log('PpPost', post))
</script>

{#if error}
    <p>Error loading post: {error}</p>
{:else if post}
<h2>{post.name}</h2>
<DynamicPost {post} />
{:else}
<p>Loading post...</p>
{/if}
