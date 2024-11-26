import { api } from 'monolith-ts-api';
import { useEffect, useState } from 'react';
import { Button } from '../Button';
import { Card } from '../Card';
import { Codette } from '../Codette';
import { defaultImages, ImageUpload } from '../ImageUpload';
import { Texticle } from '../Texticle';
import { phrasebook } from '../phrasebook';

import {
	bio as bioSchema,
	Channel,
	channelName as channelNameSchema,
	ChannelSensitives,
	tagline as taglineSchema,
} from '@lyku/json-models';
import { getChannelNameFromUrl } from '../getChannelNameFromUrl';
import styles from './MyChannel.module.sass';

export const MyChannel = () => {
	const [channel, setChannel] = useState<Channel>();
	const [queriedChannel, setQueryiedChannel] = useState(false);
	useEffect(() => {
		if (queriedChannel) return;
		setQueryiedChannel(true);
		api.getMyChannel({}).then(setChannel);
	}, [queriedChannel]);
	const [name, setName] = useState(getChannelNameFromUrl());
	const [nameValid, setNameValid] = useState(true);
	const [tagline, setTagline] = useState('');
	const [taglineValid, setTaglineValid] = useState(true);
	const [bio, setBio] = useState('');
	const [bioValid, setBioValid] = useState(true);
	const [sensitives, setSensitives] = useState<ChannelSensitives>();
	const [loadingSensitives, setLoadingSensitives] = useState(false);
	const [savable, setSavable] = useState(false);

	useEffect(
		() =>
			void api
				.getMyChannel({ name })
				.then(setChannel)
				.catch(console.error),
		[name, channel],
	);

	const saveChannel = async () => {
		if (!channel) return;
		const updatedChannel = await api.updateChannel({
			id: channel.id,
			name,
			tagline,
			bio,
		});
		if (updatedChannel) {
			if (updatedChannel.name !== channel.name)
				window.location.pathname = `/${updatedChannel.name}`;
			else window.location.reload();
		}
	};

	const validateAll = () =>
		setSavable(Boolean(channel) && nameValid && taglineValid && bioValid);

	useEffect(validateAll, [channel, nameValid, taglineValid, bioValid]);

	const showChannelSensitives = async () => {
		setLoadingSensitives(true);
		const channelId = channel?.id;
		if (!channelId) return;
		setSensitives(await api.getChannelSensitives(channelId));
		setLoadingSensitives(false);
	};

	const hideChannelSensitives = async () => setSensitives(undefined);

	return (
		<div className={styles.MyChannel}>
			<h1>
				<a href={`/${channel?.name}`}>
					{' '}
					{channel?.name ?? phrasebook.channelLoading}
				</a>
			</h1>
			{channel ? (
				<>
					<ImageUpload
						image={channel.logo}
						channelId={channel.id}
						reason={'ChannelLogo'}
					>
						{phrasebook.replaceLogo}
					</ImageUpload>
					<span className={styles.shortlines}>
						<Texticle
							empty={phrasebook.channelNameEmpty}
							valid={phrasebook.channelNameValid}
							invalid={phrasebook.channelNameInvalid}
							schema={channelNameSchema}
							onInput={setName}
							onValidation={setNameValid}
							value={name}
						/>
						<Texticle
							empty={phrasebook.taglineEmpty}
							valid={phrasebook.taglineValid}
							schema={taglineSchema}
							onInput={setTagline}
							onValidation={setTaglineValid}
							value={channel.tagline}
						/>
						{sensitives ? (
							<Button onClick={hideChannelSensitives}>
								{phrasebook.hideStreamInfo}
							</Button>
						) : (
							<Button
								onClick={showChannelSensitives}
								disabled={loadingSensitives}
							>
								{phrasebook.showStreamInfo}
							</Button>
						)}
					</span>
					<br />
					{sensitives && (
						<>
							<br />
							<Card block={true}>
								<table>
									<tbody>
										<tr>
											<th>{phrasebook.streamKey}:</th>
											<td>
												<Codette dense={true}>
													{sensitives.rtmpsKey}
												</Codette>
											</td>
										</tr>
										<tr>
											<th>{phrasebook.server}:</th>
											<td>
												<Codette>
													host.bouncing.tv
												</Codette>
											</td>
										</tr>
									</tbody>
								</table>
							</Card>
						</>
					)}
					<br />
					<Texticle
						empty={phrasebook.bioEmpty}
						valid={phrasebook.bioValid}
						schema={bioSchema}
						onInput={setBio}
						onValidation={setBioValid}
						multiline={true}
						value={channel.bio}
					/>
					<Button onClick={saveChannel} disabled={!savable}>
						Save
					</Button>
					<br />
					<ImageUpload
						image={
							channel.activeBg ??
							channel.awayBg ??
							defaultImages.ActiveChannelBackground
						}
						channelId={channel.id}
						reason={'ActiveChannelBackground'}
					>
						{phrasebook.replaceActiveBackground}
					</ImageUpload>
					<ImageUpload
						image={
							channel.awayBg ??
							channel.activeBg ??
							defaultImages.AwayChannelBackground
						}
						channelId={channel.id}
						reason={'AwayChannelBackground'}
					>
						{phrasebook.replaceAwayBackground}
					</ImageUpload>
				</>
			) : (
				phrasebook.channelNonexistent
			)}
		</div>
	);
};
