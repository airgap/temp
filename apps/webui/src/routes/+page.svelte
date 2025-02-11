<script lang="ts">
    import { browser } from '$app/environment';
</script>

{#if browser}
    <main>
        <h1>Welcome to Lyku</h1>
    </main>
{:else}
    <main>
        <h1>Loading...</h1>
    </main>
{/if}

<style>
    main {
        padding: 1rem;
    }
    h1 {
        font-size: 2rem;
        margin-bottom: 1rem;
    }
</style> 