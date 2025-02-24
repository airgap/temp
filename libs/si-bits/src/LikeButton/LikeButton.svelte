<script lang="ts">
  import { ReactionButton } from '../ReactionButton';
  import filledHeart from '../assets/filledheart.svg';
  import emptyHeart from '../assets/heart.svg';
  import { shout } from '../Sonic';
  import { UserRegistrationForm } from '../authForms';
  import { api, getSessionId } from 'monolith-ts-api';
  import type { Post } from '@lyku/json-models';

  const { post } = $props<{ post: Post }>();

  const liked = $derived(cacheStore.myLikes.get(post.id)?.liked);

  function handleClick() {
    if (!getSessionId()) {
      shout('showAuth', UserRegistrationForm);
      return;
    }
    api[liked ? 'unlikePost' : 'likePost'](post.id).catch(console.error);
  }
</script>

<ReactionButton 
  glyph={liked ? filledHeart : emptyHeart}
  on:click={handleClick}
/> 