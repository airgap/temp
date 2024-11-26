import { Divisio } from '../Divisio';
import { Fof } from '../Fof';
import { Tv } from '../Tv';
import { TvBox } from '../TvBox';
import { AchievementList } from '../AchievementList';
import { bouncingTv } from '@lyku/db-config/internalGames';

export const PlayBtv = () => {
	return (
		<Divisio layout="v" size="m">
			<TvBox>
				<Tv>
					<Fof>LYKU</Fof>
				</Tv>
			</TvBox>
			<AchievementList game={bouncingTv.id} />
		</Divisio>
	);
};
