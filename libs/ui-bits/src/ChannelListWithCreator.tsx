import { api } from 'monolith-ts-api';
import { useEffect, useState } from 'react';

import * as schemas from '@lyku/json-models';

import { Button } from './Button';
import { ChannelList } from './ChannelList';
import { Texticle } from './Texticle';
import { phrasebook } from './phrasebook';
import { Channel } from '@lyku/json-models';

export const ChannelListWithCreator = () => {
	const [channels, setChannels] = useState<Channel[]>([]);
	const [channelCreatorShown, setChannelCreatorShown] = useState(false);
	const [channelNameValid, setChannelNameValid] = useState(false);
	const [channelName, setChannelName] = useState('');
	const [queriedChannels, setQueriedChannels] = useState(false);
	useEffect(() => {
		setQueriedChannels(true);
		void api
			.listMyChannels()
			.then((channels) => {
				if (channels) setChannels(channels);
			})
			.catch(console.error);
	}, [queriedChannels]);

	const handleCreateChannel = () =>
		api
			.createChannel({ name: channelName })
			.then(() => window.location.reload())
			.catch(console.error);

	return (
		<ChannelList channels={channels} mine={true}>
			{channelCreatorShown ? (
				<div>
					<Button onClick={() => setChannelCreatorShown(false)}>
						Never Mind
					</Button>
					<Texticle
						empty={phrasebook.channelNameEmpty}
						valid={phrasebook.channelNameValid}
						invalid={phrasebook.channelNameInvalid}
						onInput={setChannelName}
						onValidation={(valid) => setChannelNameValid(valid)}
						schema={schemas.channelName}
					/>
					<Button onClick={handleCreateChannel} disabled={!channelNameValid}>
						{phrasebook.letsGo}
					</Button>
				</div>
			) : (
				<Button onClick={() => setChannelCreatorShown(true)}>
					{phrasebook.createChannel}
				</Button>
			)}
		</ChannelList>
	);
};
