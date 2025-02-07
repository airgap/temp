<script lang="ts">
  import { ReactionButton } from '../ReactionButton';
  // import { useCacheSingleton } from '../CacheProvider';
  import filledHeart from '../assets/filledheart.svg';
  import emptyHeart from '../assets/heart.svg';
  import { shout } from '../Sonic';
  import { UserRegistrationForm } from '../authForms';
  import { api, sessionId } from 'monolith-ts-api';
  import type { Post } from '@lyku/json-models';

  export let post: Post;

  $: liked = cacheStore.myLikes.get(post.id)?.liked;

  function handleClick() {
    if (!sessionId) {
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