<script lang="ts">
	import styles from './Channel.module.sass';

	const { channel, selected } = $props<{
		channel: number;
		selected: boolean;
	}>();
</script>

<a
	href="#{channel}"
	class={`${styles.Channel} ${selected ? styles.selected : ''}`}
>
	{channel}
</a>
