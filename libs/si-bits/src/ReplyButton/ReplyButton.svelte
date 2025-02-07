<script lang="ts">
  import reply from './assets/comment.svg';
  import { ReactionButton } from './ReactionButton.svelte';

  export let onClick: () => void;
</script>

<ReactionButton glyph={reply} on:click={onClick} /> 