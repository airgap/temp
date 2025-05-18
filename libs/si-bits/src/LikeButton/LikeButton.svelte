<script lang="ts">
	import { ReactionButton } from '../ReactionButton';
	import filledHeart from '../assets/filledheart.svg?raw';
	import emptyHeart from '../assets/heart.svg?raw';
	import { api } from 'monolith-ts-api';
	import type { Post } from '@lyku/json-models';
	import { cacheStore } from '../CacheProvider/CacheStore';
	import { myReactionStore, currentUserStore } from '../CacheProvider';
	import styles from './LikeButton.module.sass';

	const { post } = $props<{ post?: Post }>();

	const reaction = $derived($myReactionStore.get($post?.id));
	const react = (type?: string) => {
		myReactionStore.update($post.id, type);
		api.reactToPost({ postId: $post.id, type: type ?? '👍' });
	};
	const unreact = () => {
		myReactionStore.update($post.id, '');
		api.reactToPost({ postId: $post.id, type: '' });
	};
</script>

<ReactionButton
	disabled={$post?.author === $currentUserStore?.id}
	glyph={emptyHeart}
	onClick={reaction ? unreact : react}
	class={reaction && styles.fillMeUp}
/>
