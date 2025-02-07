<script lang="ts">
	import type { User } from '@lyku/json-models';
	import { currentUserStatus } from './currentUserStore';
	import { sessionId } from 'monolith-ts-api';

	export let loggedIn: ((user: User) => void) | undefined = undefined;
	export let loggedOut: (() => void) | undefined = undefined;
	export let failed: ((error: Error) => void) | undefined = undefined;
	export let meanwhile: (() => void) | undefined = undefined;
	export let catchall: ((props: { user: User | undefined; loading: boolean; error: Error | null }) => void) | undefined = undefined;
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