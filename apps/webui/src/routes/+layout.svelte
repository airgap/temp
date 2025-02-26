<script lang="ts">
    import { onMount } from 'svelte';
    import { initSession } from 'monolith-ts-api';
    import {DesktopNav, MobileNav, Backdrop, UserLoginForm, UserRegistrationForm} from '@lyku/si-bits';
    import { page } from '$app/stores';
    import styles from './App.module.sass';
    import { Dialog, PostCreator } from '@lyku/si-bits';

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
    }
    
    function login() {
        showLogin = true;
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
    const closeCreator = () => showCreator = false;
    const openCreator = () => showCreator = true;
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
    <Dialog visible={showCreator} ondismiss={closeCreator}>
        <PostCreator onsuccess={closeCreator}></PostCreator>
    </Dialog>
        <UserRegistrationForm 
            visible={(showJoin)} 
            ondismiss={closeJoin}
            onsuccess={closeJoin}
        />
        <UserLoginForm 
            visible={showLogin}
            ondismiss={closeLogin}
            onsuccess={closeLogin}
        />
</div>