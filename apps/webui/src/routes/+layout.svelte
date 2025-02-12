<script>
    import { onMount } from 'svelte';
    import { initSession } from 'monolith-ts-api';
    import {DesktopNav, MobileNav} from '@lyku/si-bits';
    import { page } from '$app/stores';
    onMount(() => {
        initSession();
    });
</script>

<DesktopNav url={$page.url} />
<slot />
<MobileNav url={$page.url} />