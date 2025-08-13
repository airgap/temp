<script lang="ts">
	import type { User } from '@lyku/json-models';
	import { userStore } from '../CacheProvider';
	import { sessionId } from '@lyku/monolith-ts-api';

	// Track loading and error states
	let loading = true;
	let error: Error | null = null;

	// Subscribe to the current user store
	$effect(() => {
		loading = true;
		error = null;
		const user = userStore.get(-1n);
		if (user !== undefined) {
			loading = false;
		}
	});

	const { loggedIn, loggedOut, failed, meanwhile, catchall } = $props<{
		loggedIn: ((user: User) => void) | undefined;
		loggedOut: (() => void) | undefined;
		failed: ((error: Error) => void) | undefined;
		meanwhile: (() => void) | undefined;
		catchall:
			| ((props: {
					user: User | undefined;
					loading: boolean;
					error: Error | null;
			  }) => void)
			| undefined;
	}>();
</script>

{#if loading && meanwhile}
	{meanwhile()}
{:else if error && failed}
	{failed(error)}
{:else if userStore.get(-1n) && loggedIn && sessionId}
	{loggedIn(userStore.get(-1n))}
{:else if !sessionId && loggedOut}
	{loggedOut()}
{:else if catchall}
	{catchall({
		user: userStore.get(-1n),
		loading,
		error,
	})}
{/if}
