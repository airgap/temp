<script lang="ts">
	import { api, sessionId } from 'monolith-ts-api';
	import { PostCreator } from '../PostCreator';
	import { PostList } from '../PostList';
	import { phrasebook } from '../phrasebook';
	import { Crosshatch } from '../Crosshatch';
	import { FeedPage } from '../FeedPage';

	let postsPromise = sessionId
		? api.listFeedPosts({})
		: api.listFeedPostsUnauthenticated({});
</script>

<FeedPage title="For you">
	{#if $currentUser.loading}
		Loading user...
	{:else if $currentUser.error}
		Failed to load user
	{:else if $currentUser.data}
		<PostCreator user={$currentUser.data} />
		<Crosshatch />
	{:else}
		<h2>{phrasebook.logInToPost}</h2>
	{/if}

	{#await postsPromise}
		Loading...
	{:then posts}
		<br />
		<h1>For you</h1>
		<PostList
			posts={posts ?? []}
			placeholder={`
          <div>
            <br />
            ${phrasebook.tailoredFeedEmpty}
            <br />
            <br />
            ${phrasebook.followOnHot}
          </div>
        `}
		/>
	{:catch error}
		<h1>{String(error)}</h1>
	{/await}
</FeedPage>
