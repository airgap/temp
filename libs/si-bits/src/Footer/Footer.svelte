<script lang="ts">
    import { Divisio } from './Divisio.svelte';
    import { pipe } from '@lyku/stats';
    import { Center } from './Center.svelte';
    import { Link, phrasebook } from './';
</script>

<div style="opacity: 0.5; margin-top: auto; padding: 5px;">
    <Center>
        <Divisio size="l" layout="h" alignItems="center">
            <span>&copy; 2017-2024 lyku.org</span>
            |
            <span>
                alpha version <Link href="/stats">0.{pipe}</Link>
            </span>
            |
            <span>
                Join the{' '}
                <Link href="https://discord.gg/ZAJsBhujyG">
                    {phrasebook.navDiscord}
                </Link>
            </span>
        </Divisio>
    </Center>
</div> 