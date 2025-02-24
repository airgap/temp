<script lang="ts">
  import reply from '../assets/comment.svg';
  import { ReactionButton } from '../ReactionButton';

  const { onClick } = $props<{ onClick: () => void }>();
</script>

<ReactionButton glyph={reply} on:click={onClick} /> 