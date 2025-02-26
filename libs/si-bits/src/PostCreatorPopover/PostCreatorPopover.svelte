<script lang="ts">
  import { Close } from '../Close';
  import { PostCreator } from '../PostCreator';
  import type { Post } from '@lyku/json-models';
  import { listen, shout } from '../Sonic';
  import styles from './PostCreatorPopover.module.sass';
  import { cacheStore } from '../CacheProvider';

  let echoing: Post | undefined;
  const user = cacheStore.currentUser;

  listen('echo', (post) => {
    echoing = post;
  });
</script>

{#if user && echoing}
  <div class={styles.PostCreatorPopover}>
    <div>
      <Close
        onclick={() => {
          shout('echo', undefined);
        }}
      />
      <PostCreator showInset={true} user={user} echo={echoing?.id} />
    </div>
  </div>
{/if} 