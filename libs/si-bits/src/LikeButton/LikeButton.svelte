<script lang="ts">
	import { ReactionButton } from '../ReactionButton';
	import filledHeart from '../assets/filledheart.svg?raw';
	import emptyHeart from '../assets/heart.svg?raw';
	import { api } from 'monolith-ts-api';
	import type { Post } from '@lyku/json-models';
	import { cacheStore } from '../CacheProvider/CacheStore';
	import { myLikeStore, currentUserStore } from '../CacheProvider';
	import styles from './LikeButton.module.sass';

	const { post } = $props<{ post?: Post }>();

	const liked = $derived(($myLikeStore.get($post?.id) ?? 0n) > 0n);
	const like = () => {
		myLikeStore.update($post.id);
		api.reactToPost({ postId: $post.id, type: '👍' });
	};
	const unlike = () => {
		myLikeStore.update(-$post.id);
		api.unlikePost($post.id);
	};
</script>

<ReactionButton
	disabled={$post?.author === $currentUserStore?.id}
	glyph={emptyHeart}
	onClick={liked ? unlike : like}
	class={liked && styles.fillMeUp}
/>
