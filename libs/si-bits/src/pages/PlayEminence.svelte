<script lang="ts">
	import { Divisio } from '../Divisio';
	import { AchievementList } from '../AchievementList';
	import { games } from '@lyku/stock-docs';
	// import { Eminence } from '../Eminence';
	import { Center } from '../Center';
</script>

<Center>
	<Divisio layout="v" size="m">
		<!-- <Eminence /> -->
		<AchievementList game={games.eminence.id} />
	</Divisio>
</Center>
