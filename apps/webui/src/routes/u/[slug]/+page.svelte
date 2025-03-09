<script lang="ts">
  import { api } from 'monolith-ts-api';
  import { BefriendUser, Center, Divisio, FollowUser, PostList, ProfilePicture, phrasebook } from '@lyku/si-bits';
  import { page } from '$app/state';
  import type { Post, User } from '@lyku/json-models';

  // Get identifier from URL path params using SvelteKit's $page store
  const ident = page.params.slug;


  let posts = $state<Post[]>([]);
  let user = $state<User | null>(null);
  let loading = $state(true);
  let error = $state<Error | null>(null);

  // Computed hang content for the profile
  const hangContent = $derived(() => user ? {
    component: Divisio,
    props: {
      size: "m",
      layout: "v",
      class: "linkBox",
      children: [
        FollowUser,
        BefriendUser
      ]
    }
  } : null);

  // Effect to fetch user data and posts
  $effect(() => {
    if (!ident) {
      loading = false;
      return;
    }

    loading = true;
    error = null;

    Promise.all([
      api.listUserPosts({ user: ident }),
      api.getUserByName(ident)
    ])
      .then(([fetchedPosts, fetchedUser]) => {
        posts = fetchedPosts;
        user = fetchedUser;
      })
      .catch(e => {
        error = e instanceof Error ? e : new Error(String(e));
      })
      .finally(() => {
        loading = false;
      });
  });

  // Computed properties for display
  const username = $derived(user?.username ?? 'User');
  const profilePicture = $derived(user?.profilePicture);
  const showPosts = $derived(posts.length > 0);
</script>

{#if ident}
  {#if loading}
    <Center>
      <div>Loading...</div>
    </Center>
  {:else if error}
    <Center>
      <div>Error: {error.message}</div>
    </Center>
  {:else}
    <Center>
      <div class="UserPage">
        <Divisio
          size="m"
          layout="h"
          {hangContent}
        >
          <ProfilePicture size="l" src={profilePicture} />
          <Divisio size="m" layout="v">
            <h1>{username}</h1>
            <p>{phrasebook.bioWip}</p>
          </Divisio>
        </Divisio>
        {#if showPosts}
          <PostList {posts} />
        {/if}
      </div>
    </Center>
  {/if}
{:else}
  <h1>404</h1>
{/if}

<style lang="sass">
  :global(.UserPage)
    width: 100%
    max-width: 800px

  :global(.linkBox)
    margin-left: auto
</style>
