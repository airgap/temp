<script lang="ts">
	import { CoolLink } from '../CoolLink';
	import { api } from 'monolith-ts-api';
	import type { User, FriendshipStatus } from '@lyku/json-models';
	import { phrasebook } from '../phrasebook';

	let { user } = $props<{ user: User }>();

	let status = $state<FriendshipStatus | undefined>();
	let queried = $state(false);

	$effect(() => {
		if (queried || status) return;
		queried = true;
		api.getFriendshipStatus(user.id).then((r) => {
			status = r;
			queried = false;
		});
	});
</script>

{#if status === 'befriended'}
	<CoolLink
		onClick={() => {
			status = undefined;
			api.deleteFriendship(user.id).then(() => (status = 'none'));
		}}
	>
		{phrasebook.defriend} –
	</CoolLink>
{:else if status === 'none'}
	<CoolLink
		onClick={() => {
			status = undefined;
			api.createFriendRequest(user.id).then(() => (status = 'youOffered'));
		}}
	>
		{phrasebook.befriend} +
	</CoolLink>
{:else if status === 'theyOffered'}
	<CoolLink
		onClick={() => {
			status = undefined;
			api.acceptFriendRequest(user.id).then(() => (status = 'befriended'));
		}}
	>
		{phrasebook.acceptFriendRequest} +
	</CoolLink>
	<CoolLink
		onClick={() => {
			status = undefined;
			api.declineFriendRequest(user.id).then(() => (status = 'none'));
		}}
	>
		{phrasebook.declineFriendRequest} –
	</CoolLink>
{:else if status === 'youOffered'}
	<CoolLink
		onClick={() => {
			status = undefined;
			api.declineFriendRequest(user.id).then(() => (status = 'none'));
		}}
	>
		Rescind -
	</CoolLink>
{/if}
