<script lang="ts">
	import { onMount } from 'svelte';
	import { initSession } from 'monolith-ts-api';
	import {
		Backdrop,
		Image,
		DesktopNav,
		MobileNav,
		UserLoginForm,
		UserRegistrationForm,
	} from '@lyku/si-bits';
	import { PUBLIC_CF_HASH } from '$env/static/public';
	import { page } from '$app/stores';
	import styles from './App.module.sass';
	import { Dialog, PostCreator, TermsOfService } from '@lyku/si-bits';
	import type { Post } from '@lyku/json-models';
	import type { EventHandler } from 'svelte/elements';

	const currentUser = $page.data.user;

	const { children } = $props<{ children?: () => any }>();

	let showAuth = $state(false);
	let showTos = $state(false);
	let reply = $state<bigint>();
	let echo = $state<bigint>();
	let light = $state<bigint>();
	let showLightbox = $state<boolean>(false);
	onMount(() => {
		initSession();
		const replier = (event: CustomEvent) => {
			if (!currentUser) {
				showAuth = true;
				showJoin = true;
				return;
			}
			reply = event.detail;
			showCreator = true;
		};
		const echoer = (event: CustomEvent) => {
			if (!currentUser) {
				showAuth = true;
				showJoin = true;
				return;
			}
			echo = event.detail;
			console.log('echo', echo);
			showCreator = true;
		};
		const lighter = (event: CustomEvent) => {
			console.log('e', event.detail);
			light = event.detail;
			showLightbox = true;
		};
		const events = [
			['replyTo', replier],
			['echo', echoer],
			['light', lighter],
		] as const satisfies [string, EventHandler<any>][];
		events.forEach(([event, handler]) => {
			window.addEventListener(event as any, handler);
		});
		return () =>
			events.forEach(([event, handler]) => {
				window.removeEventListener(event as any, handler);
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
	<Backdrop visible={showJoin || showLogin} />
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
		bind:visible={showCreator}
		size="l"
		animation="slide-top"
		variant="profile"
	>
		<PostCreator onsuccess={closeCreator} {reply} {echo}></PostCreator>
	</Dialog>
	<Dialog bind:visible={showAuth} animation="slide-top">
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
	<Dialog size="m" bind:visible={showTos} animation="slide-bottom">
		<TermsOfService />
	</Dialog>
	<Dialog
		bind:visible={showLightbox}
		pad="z"
		style="overflow: hidden; width: auto; max-width: 700px; display: inline-block; position: absolute; left: 50vw"
		transform="translateX(-50%)"
		animation="zoom"
	>
		<img
			alt="a pic"
			src={light
				? `https://imagedelivery.net/${PUBLIC_CF_HASH}/${light.toString()}/btvprofile`
				: ''}
			style="margin-bottom: -5px; max-width: 100%; max-height: 100%; object-fit: contain"
		/>
	</Dialog>
</div>
