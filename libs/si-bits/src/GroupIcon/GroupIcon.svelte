<script>
	import styles from './GroupIcon.module.sass';
	import { groupStore } from '../CacheProvider';
	import { Image } from '../Image';
	const props = $props();
	const group = $derived(groupStore.get(props.group));
	const classes = $derived([styles.GroupIconText, styles[props.size ?? 'm']]);
</script>

{#if group.icon}
	<img src={group.icon} alt={group.name} class={classes} />
{:else}
	<span class={classes}>{group.name.substring(0, 2)}</span>
{/if}
