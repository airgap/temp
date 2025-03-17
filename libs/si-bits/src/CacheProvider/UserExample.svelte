<script lang="ts">
	import { useUser, useUsers } from './useCacheData';
	import type { User } from '@lyku/json-models';

	// Example props
	const { userId, userIds = [] } = $props<{
		userId?: bigint;
		userIds?: bigint[];
	}>();

	// Get a single user
	const singleUser = $derived(userId ? useUser(userId) : undefined);

	// Get multiple users
	const multipleUsers = $derived(useUsers(userIds));

	// Example of using the store in a reactive statement
	$effect(() => {
		if (singleUser) {
			console.log(`User loaded: ${singleUser.username}`);
		}
	});
</script>

<div>
	<!-- Single user example -->
	{#if userId}
		<div>
			<h3>Single User</h3>
			{#if singleUser}
				<p>Username: {singleUser.username}</p>
			{:else}
				<p>Loading user...</p>
			{/if}
		</div>
	{/if}

	<!-- Multiple users example -->
	{#if userIds.length > 0}
		<div>
			<h3>Multiple Users</h3>
			<ul>
				{#each multipleUsers as user, i}
					<li>
						{#if user}
							User {i}: {user.username}
						{:else}
							Loading user {i}...
						{/if}
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>
