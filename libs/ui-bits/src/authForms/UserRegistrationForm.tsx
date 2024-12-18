import { api } from 'monolith-ts-api';
import { useState } from 'react';

import { Agreeable } from '../Agreeable';
import { EmailInput } from '../EmailInput';
import { PasswordInput } from '../PasswordInput';
import { ShowTos } from '../ShowTos';
import { shout } from '../Sonic';
import { SubmitButton } from '../SubmitButton';
import { UsernameInput } from '../UsernameInput';
import { phrasebook } from '../phrasebook';
import { setCookie } from 'monolith-ts-api';

export const UserRegistrationForm = () => {
	const [email, setEmail] = useState('');
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [emailValid, setEmailValid] = useState(false);
	const [usernameValid, setUsernameValid] = useState(false);
	const [passwordValid, setPasswordValid] = useState(false);
	const [agreed, setAgreed] = useState(false);
	const [error, setError] = useState();
	return (
		<>
			<h2>{phrasebook.regFormTitle}</h2>
			<EmailInput onInput={setEmail} onValidation={setEmailValid} />
			<UsernameInput onInput={setUsername} onValidation={setUsernameValid} />
			<PasswordInput onInput={setPassword} onValidation={setPasswordValid} />
			<Agreeable onChange={setAgreed}>
				{phrasebook.termsLabel} <ShowTos>{phrasebook.termsLink}</ShowTos>
			</Agreeable>
			<SubmitButton
				disabled={!(emailValid && usernameValid && passwordValid && agreed)}
				onClick={() => {
					shout('submitClicked', {});
					api
						.registerUser({
							email,
							username,
							password,
							agreed: agreed as true,
						})
						.then((sessionId) => {
							setCookie('sessionId', sessionId, 365);
							window.location.reload();
						})
						.catch((e) => setError(e));
				}}
			>
				Register
			</SubmitButton>
			{error && <h3>{error}</h3>}
		</>
	);
};
