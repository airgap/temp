<script lang="ts">
	import type { User } from '@lyku/json-models';
	import { currentUserStatus } from './currentUserStore';
	import { sessionId } from 'monolith-ts-api';

	const { loggedIn, loggedOut, failed, meanwhile, catchall } = $props<{ loggedIn: ((user: User) => void) | undefined, loggedOut: (() => void) | undefined, failed: ((error: Error) => void) | undefined, meanwhile: (() => void) | undefined, catchall: ((props: { user: User | undefined; loading: boolean; error: Error | null }) => void) | undefined }>();
</script>

{#if $currentUserStatus.loading && meanwhile}
	{meanwhile()}
{:else if $currentUserStatus.error && failed}
	{failed($currentUserStatus.error)}
{:else if $currentUserStatus.user && loggedIn && sessionId}
	{loggedIn($currentUserStatus.user)}
{:else if !sessionId && loggedOut}
	{loggedOut()}
{:else if catchall}
	{catchall($currentUserStatus)}
{/if}