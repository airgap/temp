<script lang="ts">
	import reply from '../assets/comment.svg?raw';
	import { ReactionButton } from '../ReactionButton';
	import type { Post } from '@lyku/json-models';
	const { post } = $props<{ post: Post }>();
</script>

<ReactionButton
	glyph={reply}
	onClick={() =>
		window.dispatchEvent(new CustomEvent('replyTo', { detail: post.id }))}
/>
