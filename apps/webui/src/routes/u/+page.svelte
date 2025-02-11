<script lang="ts">
  import { api } from 'monolith-ts-api';
  import { PostList } from '@lyku/si-bits';
  import { ProfilePicture } from '@lyku/si-bits';
  import { phrasebook } from '@lyku/si-bits';
  import { Divisio } from '@lyku/si-bits';
  import { Center } from '@lyku/si-bits';
  import { BefriendUser } from '@lyku/si-bits';
  import { FollowUser } from '@lyku/si-bits';
  
  const pathWithUsernameOrIdRegex = new RegExp(`^/u(?:ser)?/([^/]+)$`);
  const getUsernameOrIdFromUrl = () =>
    window.location.pathname.match(pathWithUsernameOrIdRegex)?.[1];
  
  const ident = getUsernameOrIdFromUrl();
  
  let postsPromise: Promise<any[]>;
  let userPromise: Promise<any>;
  
  if (ident) {
    postsPromise = api.listUserPosts({ user: ident });
    userPromise = api.getUserByName(ident);
  }

  $: hangContent = user ? {
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
  } : null;
</script>

{#if ident}
  {#await Promise.all([postsPromise, userPromise])}
    <Center>
      <div>Loading...</div>
    </Center>
  {:then [posts, user]}
    <Center>
      <div class="UserPage">
        <Divisio
          size="m"
          layout="h"
          {hangContent}
        >
          <ProfilePicture size="l" url={user?.profilePicture} />
          <Divisio size="m" layout="v">
            <h1>{user?.username ?? 'User'}</h1>
            <p>{phrasebook.bioWip}</p>
          </Divisio>
        </Divisio>
        {#if posts}
          <PostList {posts} />
        {/if}
      </div>
    </Center>
  {:catch error}
    <Center>
      <div>Error: {error.message}</div>
    </Center>
  {/await}
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