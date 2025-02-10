<script lang="ts">
    export let timestamp: number;
    
    $: [date, time] = new Date(timestamp).toISOString().split('T');
</script>

{date} at
<br />
{time} 