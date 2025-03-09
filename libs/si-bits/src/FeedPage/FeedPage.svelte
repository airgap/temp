<script lang="ts">
    import styles from './Feed.module.sass';
    const {children} = $props<{children?: ComponentType}>()
</script>

<div class={styles.FeedPage}>
    <div class={styles.Feed}>
        {@render children?.()}
    </div>
</div>
