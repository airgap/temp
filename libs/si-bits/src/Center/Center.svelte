<script lang="ts">
    const {children} = $props<{children?: ComponentType}>();
</script>
<div class="center">
    {@render children?.()}
</div>

<style>
    .center {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        text-align: center;
    }
</style> 