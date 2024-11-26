import { Gol } from '../Gol';
import { TvFrame } from '../TvFrame';

import './PlayGol.module.sass';

export const PlayGol = () => (
	<div className="PlayGol">
		<TvFrame size="auto">
			<Gol />
		</TvFrame>
	</div>
);
