<script lang="ts">
	import { onMount } from 'svelte';
	import { initSession } from 'monolith-ts-api';
	import {
		DesktopNav,
		MobileNav,
		Backdrop,
		UserLoginForm,
		UserRegistrationForm,
	} from '@lyku/si-bits';
	import { page } from '$app/stores';
	import styles from './App.module.sass';
	import { Dialog, PostCreator, TermsOfService } from '@lyku/si-bits';

	const currentUser = $page.data.user;

	const { children } = $props<{ children?: () => any }>();

	let showAuth = $state(false);
	let showTos = $state(false);
	let reply = $state<bigint>();
	let echo = $state<bigint>();
	onMount(() => {
		initSession();
		// fucking whatever
		window.addEventListener('replyTo' as any, (event: CustomEvent) => {
			console.log('replyTo', event.detail);
			reply = event.detail;
			showCreator = true;
		});
		window.addEventListener('echo' as any, (event: CustomEvent) => {
			console.log('echo', event.detail);
			echo = event.detail;
			showCreator = true;
		});
	});

	let showJoin = $state(false);
	let showLogin = $state(false);

	function join() {
		showJoin = true;
		showLogin = false;
		showAuth = true;
	}

	function login() {
		showLogin = true;
		showJoin = false;
		showAuth = true;
	}

	function closeJoin() {
		showJoin = false;
	}

	function closeLogin() {
		showLogin = false;
	}

	// Handle escape key to close forms
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			showJoin = false;
			showLogin = false;
		}
	}
	let showCreator = $state(false);
	const closeCreator = () => (showCreator = false);
	const openCreator = () => (showCreator = true);
</script>

<svelte:window onkeydown={handleKeydown} />

<div class={styles.App}>
	<Backdrop
		visible={showJoin || showLogin}
		onclick={() => {
			showAuth = false;
		}}
	/>
	<DesktopNav
		url={$page.url}
		user={currentUser}
		onjoin={join}
		onlogin={login}
		oncreate={openCreator}
		onshowtos={() => (showTos = true)}
	/>
	{@render children?.()}
	<MobileNav
		url={$page.url}
		user={currentUser}
		onjoin={join}
		onlogin={login}
		oncreate={openCreator}
	/>
	<Dialog
		visible={showCreator}
		ondismiss={closeCreator}
		size="l"
		animation="slide-top"
	>
		<PostCreator onsuccess={closeCreator} {reply} {echo}></PostCreator>
	</Dialog>
	<Dialog
		visible={showAuth}
		ondismiss={() => (showAuth = false)}
		animation="slide-top"
	>
		{#if showJoin}
			<UserRegistrationForm
				onsuccess={() => (showAuth = false)}
				onshowtos={() => (showTos = true)}
			/>
		{/if}
		{#if showLogin}
			<UserLoginForm onsuccess={() => (showAuth = false)} />
		{/if}
	</Dialog>
	<Dialog
		size="m"
		visible={showTos}
		ondismiss={() => (showTos = false)}
		animation="slide-bottom"
	>
		<TermsOfService />
	</Dialog>
</div>
