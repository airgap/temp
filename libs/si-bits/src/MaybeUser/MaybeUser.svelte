<script lang="ts">
	import type { User } from '@lyku/json-models';
	import { currentUserStore } from '../CacheProvider/CurrentUserStore';
	import { sessionId } from 'monolith-ts-api';

	// Track loading and error states
	let loading = true;
	let error: Error | null = null;

	// Subscribe to the current user store
	$effect(() => {
		loading = true;
		error = null;
		const user = currentUserStore.get();
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
{:else if $currentUserStore && loggedIn && sessionId}
	{loggedIn($currentUserStore)}
{:else if !sessionId && loggedOut}
	{loggedOut()}
{:else if catchall}
	{catchall({
		user: $currentUserStore,
		loading,
		error,
	})}
{/if}
