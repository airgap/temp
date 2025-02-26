<script lang="ts">
    import { onMount } from 'svelte';
    import { initSession } from 'monolith-ts-api';
    import {DesktopNav, MobileNav, Backdrop, UserLoginForm, UserRegistrationForm} from '@lyku/si-bits';
    import { page } from '$app/stores';
    import styles from './App.module.sass';

    const pageUrl = $derived($page.url);
    const currentUser = $derived($page.data.currentUser);

    const { children } = $props<{ children?: () => any }>();
    onMount(() => {
        initSession();
    });

    let showJoin = $state(false);
    let showLogin = $state(false);
    
    function join() {
        showJoin = true;
        showLogin = false; // Ensure only one form is shown at a time
    }
    
    function login() {
        showLogin = true;
        showJoin = false; // Ensure only one form is shown at a time
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
</script>

<svelte:window onkeydown={handleKeydown}/>

<div class={styles.App}>
    <Backdrop visible={showJoin || showLogin} onclick={() => { showJoin = false; showLogin = false; }}/>
    <DesktopNav 
        url={pageUrl} 
        user={currentUser}
        onjoin={join} 
        onlogin={login} 
    />
    {@render children?.()}
    <MobileNav 
        url={pageUrl} 
        user={currentUser}
        onjoin={join} 
        onlogin={login} 
    />
        <UserRegistrationForm 
            visible={showJoin} 
            ondismiss={closeJoin}
            onsuccess={closeJoin}
        />
        <UserLoginForm 
            visible={showLogin}
            ondismiss={closeLogin}
            onsuccess={closeLogin}
        />
</div>