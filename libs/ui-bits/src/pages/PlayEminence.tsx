import { Divisio } from '../Divisio';
import { AchievementList } from '../AchievementList';
import { eminence } from '@lyku/db-config/internalGames';
// import { Eminence } from '../Eminence';
import { Center } from '../Center';

export const PlayEminence = () => {
	return (
		<Center>
			<Divisio layout="v" size="m">
				{/* <Eminence /> */}
				<AchievementList game={eminence.id} />
			</Divisio>
		</Center>
	);
};
