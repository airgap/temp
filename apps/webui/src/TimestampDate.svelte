<script lang="ts">
	const { timestamp } = $props<{ timestamp: number }>();

	const [date, time] = new Date(timestamp).toISOString().split('T');
</script>

{date} at
<br />
{time}
