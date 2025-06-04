<script>
	import { onMount, onDestroy } from 'svelte';
	// import { browser } from '$app/environment'

	let hcaptcha;
	let hcaptchaWidgetID;

	let { token = $bindable(), isValid = $bindable() } = $props();

	onMount(() => {
		setTimeout(function () {
			if (window) {
				hcaptcha = window.hcaptcha;
				if (hcaptcha.render) {
					hcaptchaWidgetID = hcaptcha.render('hcaptcha', {
						sitekey: '5d721706-af2e-4720-a3a4-eae2b434c4be',
						size: 'normal',
						callback: onValidCaptcha,
						'error-callback': onErrorCaptcha,
						theme: 'dark',
					});
				}
			}
		}, 500);
	});
	onDestroy(() => {
		if (window) {
			hcaptcha = null;
		}
	});

	function onValidCaptcha(e) {
		console.log('Captcha verified', e);
		token = e;
		isValid = true;
	}

	function onErrorCaptcha(e) {
		console.log('Captcha errored', { error: e.error });
		token = null;
		isValid = false;
		hcaptcha.reset(hcaptchaWidgetID);
	}
</script>

<svelte:head>
	<script
		src="https://js.hcaptcha.com/1/api.js?render=explicit"
		async
		defer
	></script>
</svelte:head>

<div id="hcaptcha" class="h-captcha border-0" />
