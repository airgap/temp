import { api } from 'monolith-ts-api';
import React, { useCallback, useState } from 'react';

import * as schemas from '@lyku/json-models';
import { Button } from './Button';
import { Texticle } from './Texticle';
import { UserList } from './UserList';
import { phrasebook } from './phrasebook';
import { useFuture } from 'use-future';

export const BotListWithCreator = () => {
	const [botCreatorShown, setBotCreatorShown] = useState(false);
	const [botNameValid, setBotNameValid] = useState(false);
	const [botName, setBotName] = useState('');
	const [bots] = useFuture(() => api.listMyBots());

	const handleCreateBot = useCallback(
		() =>
			api
				.createBot({ username: botName })
				.then(() => window.location.reload())
				.catch(error => alert(error)),
		[botName],
	);

	return (
		<UserList users={bots ?? []} mine={true}>
			{botCreatorShown ? (
				<div>
					<Button onClick={() => setBotCreatorShown(false)}>
						{phrasebook.neverMind}
					</Button>
					<Texticle
						empty={phrasebook.botNameEmpty}
						valid={phrasebook.botNameValid}
						invalid={phrasebook.botNameInvalid}
						onInput={setBotName}
						onValidation={setBotNameValid}
						schema={schemas.username}
					/>
					<Button onClick={handleCreateBot} disabled={!botNameValid}>
						{phrasebook.letsGo}
					</Button>
				</div>
			) : (
				<Button onClick={() => setBotCreatorShown(true)}>
					{phrasebook.createBot}
				</Button>
			)}
		</UserList>
	);
};
