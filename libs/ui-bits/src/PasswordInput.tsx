import { password } from '@lyku/json-models';

import { Texticle, TexticleProps } from './Texticle';
import { phrasebook } from './phrasebook';

export const PasswordInput = (props: TexticleProps) => (
	<Texticle
		type="password"
		schema={password}
		empty={phrasebook.passwordFieldEmpty}
		invalid={phrasebook.passwordFieldInvalid}
		valid={phrasebook.passwordFieldValid}
		{...props}
	/>
);
