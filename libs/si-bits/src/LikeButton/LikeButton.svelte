<script lang="ts">
	import { ReactionButton } from '../ReactionButton';
	import filledHeart from '../assets/filledheart.svg?raw';
	import emptyHeart from '../assets/heart.svg?raw';
	import { api } from 'monolith-ts-api';
	import type { Post } from '@lyku/json-models';
	import { myReactionStore, userStore } from '../CacheProvider';
	import styles from './LikeButton.module.sass';

	const { post } = $props<{ post?: Post }>();

	// Derived state for the reaction
	const reaction = $derived(
		post?.id ? myReactionStore.get(post.id) : undefined,
	);

	// Effects for debugging
	$effect(() => {
		console.log('reaction for post', post?.id, ':', reaction);
	});

	$effect(() => {
		console.log(
			'current user:',
			userStore.get(-1n)?.id,
			'post author:',
			post?.author,
		);
	});

	// Reaction handlers
	const react = (type?: string) => {
		if (!post?.id) return;

		myReactionStore.set(post.id, type ?? '👍');
		api.reactToPost({ postId: post.id, type: type ?? '👍' });
	};

	const unreact = () => {
		if (!post?.id) return;

		myReactionStore.set(post.id, '');
		api.reactToPost({ postId: post.id, type: '' });
	};

	// Computed properties
	const isDisabled = $derived(post?.author === userStore.get(-1n)?.id);
	const hasReaction = $derived(!!reaction);
</script>

<ReactionButton
	disabled={isDisabled}
	glyph={emptyHeart}
	onClick={hasReaction ? unreact : () => react('👍')}
	class={hasReaction ? styles.fillMeUp : ''}
/>
