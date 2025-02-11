<script lang="ts">
  import { api } from 'monolith-ts-api';
  import { PostList } from '@lyku/si-bits';
  import { FeedPage } from '@lyku/si-bits';
  let postsPromise = api.listHotPosts({});
</script>

<FeedPage>
  {#await postsPromise}
    <p>Loading posts...</p>
  {:then response}
    <div class={styles.Feed}>
      <PostList posts={response?.posts ?? []} />
    </div>
  {:catch error}
    <h3>{String(error)}</h3>
  {/await}
</FeedPage> 