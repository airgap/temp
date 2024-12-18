import { username } from '@lyku/json-models';

import { Texticle, TexticleProps } from './Texticle';
import { phrasebook } from './phrasebook';

export const UsernameInput = (props: TexticleProps) => (
	<Texticle
		schema={username}
		empty={phrasebook.usernameFieldEmpty}
		invalid={phrasebook.usernameFieldInvalid}
		valid={phrasebook.usernameFieldValid}
		{...props}
	/>
);
