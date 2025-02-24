<script lang="ts">
    import type { Post } from '@lyku/json-models';
    import echo from '../assets/repeat.svg';
    import { shout } from '../Sonic';
    import { ReactionButton } from '../ReactionButton';

    const { post } = $props<{ post: Post }>();
</script>

<ReactionButton glyph={echo} onclick={() => shout('echo', post)} /> 