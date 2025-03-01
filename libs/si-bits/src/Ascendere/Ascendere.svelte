<script lang="ts">
    import type { ComponentType } from 'svelte';

    let { children } = $props<{ children: ComponentType }>();
</script>

<div class="ascendere">
    {@render children?.()}
</div>

<style lang="sass">
    .ascendere
        position: relative
        height: 100%
        flex: 1
        display: flex
        justify-content: flex-end
        align-items: flex-start
</style>