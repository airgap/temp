import { api } from 'monolith-ts-api';
import { ttfFlowMode } from '@lyku/json-models';
import { Button } from './Button';
import { phrasebook } from './phrasebook';

export const TtfBotList = ({ onClose }: { onClose?: () => void }) => (
	<>
		<Button onClick={onClose}>&lt; Back</Button>
		{ttfFlowMode.enum.map((mode) => (
			<Button
				onClick={() => {
					api
						.newAiTtfMatch(mode)
						.then(({ id }) => (window.location.hash = id.toString()));
				}}
			>
				{
					{
						novice: phrasebook.vsNoviceAi,
						easy: phrasebook.vsEasyAi,
						medium: phrasebook.vsMediumAi,
						hard: phrasebook.vsHardAi,
					}[mode]
				}
			</Button>
		))}
	</>
);
