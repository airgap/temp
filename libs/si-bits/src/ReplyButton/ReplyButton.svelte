<script lang="ts">
	import reply from '../assets/comment.svg?raw';
	import { ReactionButton } from '../ReactionButton';

	const { onClick } = $props<{ onClick: () => void }>();
</script>

<ReactionButton glyph={reply} onclick={onClick} />
