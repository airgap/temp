<script lang="ts">
	import { api, setCookie } from 'monolith-ts-api';
	import { Agreeable } from '../Agreeable';
	import { EmailInput } from '../EmailInput';
	import { PasswordInput } from '../PasswordInput';
	import { ShowTos } from '../ShowTos';
	import { shout } from '../Sonic';
	import { SubmitButton } from '../SubmitButton';
	import { UsernameInput } from '../UsernameInput';
	import { phrasebook } from '../phrasebook';
	import { createEventDispatcher } from 'svelte';
	import { Dialog } from '../Dialog';
	let {
		email,
		username,
		password,
		emailValid,
		usernameValid,
		passwordValid,
		agreed,
		error,
	} = $state({
		email: '',
		username: '',
		password: '',
		emailValid: false,
		usernameValid: false,
		passwordValid: false,
		agreed: false,
		error: undefined,
	});
	const valid = $derived(
		emailValid && usernameValid && passwordValid && agreed,
	);

	const { onsubmit, onsuccess, onerror, onshowtos } = $props<{
		onsubmit: () => void;
		onsuccess: () => void;
		onerror: () => void;
	}>();
	function handleSubmit() {
		onsubmit?.();
		api
			.registerUser({
				email,
				username,
				password,
				agreed: agreed as true,
			})
			.then((sessionId) => {
				// setCookie('sessionId', sessionId, 365);
				onsuccess?.();
				// alert('success');
				window.location.reload();
			})
			.catch((e) => {
				onerror?.();
				error = e;
			});
	}
</script>

<h2>{phrasebook.regFormTitle}</h2>

<EmailInput
	oninput={(e) => (email = e.target.value)}
	onvalidation={(e) => (emailValid = e)}
/>

<UsernameInput
	oninput={(e) => (username = e.target.value)}
	onvalidation={(e) => (usernameValid = e)}
/>

<PasswordInput
	oninput={(e) => (password = e.target.value)}
	onvalidation={(e) => {
		passwordValid = e;
	}}
/>

<Agreeable
	oninput={(e) => {
		agreed = e.target.checked;
	}}
	{onshowtos}
></Agreeable>

<SubmitButton disabled={!valid} onClick={handleSubmit}>
	{phrasebook.regFormTitle}
</SubmitButton>

{#if error}
	<h3>{error}</h3>
{/if}
