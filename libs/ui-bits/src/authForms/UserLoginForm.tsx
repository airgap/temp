import { api } from 'monolith-ts-api';
import { useState } from 'react';

import { EmailInput } from '../EmailInput';
import { PasswordInput } from '../PasswordInput';
import { shout } from '../Sonic';
import { SubmitButton } from '../SubmitButton';
import { phrasebook } from '../phrasebook';
import { setCookie } from 'monolith-ts-api';

/**
 * @noInheritDoc
 */
export const UserLoginForm = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [emailValid, setEmailValid] = useState(false);
	const [passwordValid, setPasswordValid] = useState(false);
	return (
		<>
			<h2>{phrasebook.loginFormTitle}</h2>
			<EmailInput onInput={setEmail} onValidation={setEmailValid} />
			<PasswordInput
				onInput={setPassword}
				onValidation={setPasswordValid}
			/>
			<SubmitButton
				disabled={!(emailValid && passwordValid)}
				onClick={() => {
					shout('submitClicked', {});
					api.loginUser({
						email,
						password,
					})
						.then(({ sessionId }) => {
							setCookie('sessionId', sessionId, 365);
							window.location.reload();
						})
						.catch(alert);
				}}
			>
				{phrasebook.loginFormSubmit}
			</SubmitButton>
		</>
	);
};
