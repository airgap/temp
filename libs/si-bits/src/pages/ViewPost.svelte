<script lang="ts">
  import { api } from 'monolith-ts-api';
  import { DynamicPost } from '../DynamicPost';
  import styles from './ViewPost.module.sass';

  const postId = BigInt(window.location.pathname.split('p/')[1]);
  const postPromise = api.getPost(postId);
</script>

<div class={styles.PostPage}>
  <main>
    {#await postPromise}
      <p>Loading...</p>
    {:then post}
      <DynamicPost {post} showReplies={true} />
    {:catch error}
      <h3>{error?.toString()}</h3>
    {/await}
  </main>
</div> 