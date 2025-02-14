<script>
    import { onMount } from 'svelte';
    import { initSession } from 'monolith-ts-api';
    import {DesktopNav, MobileNav, Backdrop} from '@lyku/si-bits';
    import { page } from '$app/stores';
    import styles from './App.module.sass';
    onMount(() => {
        initSession();
    });
</script>

<div class={styles.App}>
    <Backdrop />
    <DesktopNav url={$page.url} />
    <slot />
    <MobileNav url={$page.url} />
</div>