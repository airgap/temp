<script lang="ts">
    export let text: string;
</script>

{@html text}

<style>
    :global(.highlight) {
        background-color: grey;
        color: black;
        text-decoration: none;
        border-radius: 3px;
        padding: 0 2px;
    }
</style> 