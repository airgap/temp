<script lang="ts">
	import { api, setCookie } from 'monolith-ts-api';
	import { EmailInput } from '../EmailInput';
	import { PasswordInput } from '../PasswordInput';
	import { shout } from '../Sonic';
	import { SubmitButton } from '../SubmitButton';
	import { phrasebook } from '../phrasebook';
	import HCaptcha from '../HCaptcha.svelte';

	// Props
	const { onsubmit, onsuccess, onerror } = $props<{
		onsubmit: () => void;
		onsuccess: () => void;
		onerror: () => void;
	}>();
	let captcha = $state();
	let captchaValid = $state();

	// Form state
	let email = $state('');
	let password = $state('');
	let emailValid = $state(false);
	let passwordValid = $state(false);
	let error = $state<Error | null>(null);

	// Computed form validity
	const isFormValid = $derived(emailValid && passwordValid && captchaValid);

	// Event handlers
	function handleEmailInput(e: CustomEvent<string>) {
		email = e.detail;
	}

	function handlePasswordInput(e: CustomEvent<string>) {
		password = e.detail;
	}

	function handleEmailValidation(e: CustomEvent<boolean>) {
		emailValid = e.detail;
	}

	function handlePasswordValidation(e: CustomEvent<boolean>) {
		passwordValid = e.detail;
	}

	async function handleSubmit() {
		try {
			onsubmit();
			error = null;

			const { sessionId } = await api.loginUser({
				email,
				password,
				captcha: captcha,
			});
			setCookie('sessionId', sessionId, 365);
			onsuccess();
			window.location.reload();
		} catch (e) {
			error = e instanceof Error ? e : new Error(String(e));
			onerror();
		}
	}
</script>

<h2>{phrasebook.loginFormTitle}</h2>

<EmailInput oninput={handleEmailInput} onvalidation={handleEmailValidation} />

<PasswordInput
	oninput={handlePasswordInput}
	onvalidation={handlePasswordValidation}
/>
<HCaptcha bind:token={captcha} bind:isValid={captchaValid} />

{#if error}
	<div class="error">
		{error.message}
	</div>
{/if}

<SubmitButton disabled={!isFormValid} onClick={handleSubmit}>
	{@html phrasebook.loginFormSubmit}
</SubmitButton>

<style lang="sass">
  .error
    color: red
    margin: 1rem 0
</style>
