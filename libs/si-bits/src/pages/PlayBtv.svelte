<script lang="ts">
	import { Divisio } from '../Divisio';
	import { Fof } from '../Fof';
	import { Tv } from '../Tv';
	import { TvBox } from '../TvBox';
	import { AchievementList } from '../AchievementList';
	import { games } from '@lyku/stock-docs';
</script>

<Divisio layout="v" size="m">
	<TvBox>
		<Tv>
			<Fof>LYKU</Fof>
		</Tv>
	</TvBox>
	<AchievementList game={games.bouncingTv.id} />
</Divisio>
