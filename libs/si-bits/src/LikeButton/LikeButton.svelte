<script lang="ts">
	import { ReactionButton } from '../ReactionButton';
	import filledHeart from '../assets/filledheart.svg?raw';
	import emptyHeart from '../assets/heart.svg?raw';
	import { api } from 'monolith-ts-api';
	import type { Post } from '@lyku/json-models';
	import { cacheStore } from '../CacheProvider/CacheStore';

	const { post } = $props<{ post: Post }>();

	const liked = $derived(cacheStore.myLikes.get(post.id)?.liked);
</script>

<ReactionButton
	glyph={liked ? filledHeart : emptyHeart}
	onClick={() =>
		api[liked ? 'unlikePost' : 'likePost'](post.id).catch(console.error)}
/>
