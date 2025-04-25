<script lang="ts">
	import { prettyTime } from '@lyku/helpers';
	import styles from './DynamicDate.module.sass';

	const { time } = $props<{
		time?: Date;
	}>();
</script>

<span class={styles.DynamicDate}>{time ? prettyTime(time) : '   '}</span>
