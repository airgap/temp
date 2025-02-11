<script>
    import { onMount } from 'svelte';
    import { initSession } from 'monolith-ts-api';
    import {DesktopNav, MobileNav} from '@lyku/si-bits';

    onMount(() => {
        initSession();
    });
</script>

<DesktopNav />
{@render children()}
<MobileNav />