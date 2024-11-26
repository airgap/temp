import { jsonPrimitives } from 'from-schema';

import { Texticle, TexticleProps } from './Texticle';
import { phrasebook } from './phrasebook';
const { email } = jsonPrimitives;

export const EmailInput = (props: TexticleProps) => (
	<Texticle
		type="email"
		schema={email}
		empty={phrasebook.emailFieldEmpty}
		invalid={phrasebook.emailFieldInvalid}
		valid={phrasebook.emailFieldValid}
		{...props}
	/>
);
