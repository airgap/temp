<script>
    import { onMount } from 'svelte';
    import { initSession } from 'monolith-ts-api';
    import {DesktopNav, MobileNav, Backdrop, listen, UserLoginForm, UserRegistrationForm} from '@lyku/si-bits';
    import { page } from '$app/stores';
    import styles from './App.module.sass';
    onMount(() => {
        initSession();
    });
    let form = $state(null);

    let showJoin = $state(false);
    let showLogin = $state(false);
    const join = () => {
        console.log('join');
        showJoin = true;
    }
    const login = () => {
        console.log('login');
        showLogin = true;
    }
</script>

<div class={styles.App}>
    <Backdrop />
    <DesktopNav url={$page.url} on:join={join} on:login={login} />
    <slot />
    <MobileNav url={$page.url} on:join={join} on:login={login} />
    {#if showJoin}
        <UserRegistrationForm visible={showJoin} />
    {/if}
    {#if showLogin}
        <UserLoginForm visible={showLogin} />
    {/if}
</div>