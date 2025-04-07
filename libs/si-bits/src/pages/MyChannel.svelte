<script lang="ts">
	import { api } from 'monolith-ts-api';
	import { Button } from '../Button';
	import { Card } from '../Card';
	import { Codette } from '../Codette';
	import { defaultImages, ImageUpload } from '../ImageUpload';
	import { Texticle } from '../Texticle';
	import { phrasebook } from '../phrasebook';
	import {
		bio as bioSchema,
		type Channel,
		channelName as channelNameSchema,
		type ChannelSensitives,
		tagline as taglineSchema,
	} from '@lyku/json-models';
	import { getChannelNameFromUrl } from '../getChannelNameFromUrl';
	import styles from './MyChannel.module.sass';

	let channel: Channel | undefined;
	let name = getChannelNameFromUrl();
	let nameValid = true;
	let tagline = '';
	let taglineValid = true;
	let bio = '';
	let bioValid = true;
	let sensitives: ChannelSensitives | undefined;
	let loadingSensitives = false;
	let savable = false;

	$: {
		api.getMyChannel({ name }).then(setChannel).catch(console.error);
	}

	$: savable = Boolean(channel) && nameValid && taglineValid && bioValid;

	function setChannel(newChannel: Channel | undefined) {
		channel = newChannel;
	}

	async function saveChannel() {
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
	}

	async function showChannelSensitives() {
		loadingSensitives = true;
		const channelId = channel?.id;
		if (!channelId) return;
		sensitives = await api.getChannelSensitives(channelId);
		loadingSensitives = false;
	}

	function hideChannelSensitives() {
		sensitives = undefined;
	}
</script>

<div class={styles.MyChannel}>
	<h1>
		<a href="/{channel?.name}">
			{channel?.name ?? phrasebook.channelLoading}
		</a>
	</h1>
	{#if channel}
		<ImageUpload
			image={channel.logo}
			channelId={channel.id}
			reason="ChannelLogo"
		>
			{phrasebook.replaceLogo}
		</ImageUpload>
		<span class={styles.shortlines}>
			<Texticle
				empty={phrasebook.channelNameEmpty}
				valid={phrasebook.channelNameValid}
				invalid={phrasebook.channelNameInvalid}
				schema={channelNameSchema}
				onInput={(v) => (name = v)}
				onValidation={(v) => (nameValid = v)}
				value={name}
			/>
			<Texticle
				empty={phrasebook.taglineEmpty}
				valid={phrasebook.taglineValid}
				schema={taglineSchema}
				onInput={(v) => (tagline = v)}
				onValidation={(v) => (taglineValid = v)}
				value={channel.tagline}
			/>
			{#if sensitives}
				<Button onClick={hideChannelSensitives}>
					{phrasebook.hideStreamInfo}
				</Button>
			{:else}
				<Button onClick={showChannelSensitives} disabled={loadingSensitives}>
					{phrasebook.showStreamInfo}
				</Button>
			{/if}
		</span>
		<br />
		{#if sensitives}
			<br />
			<Card block={true}>
				<table>
					<tbody>
						<tr>
							<th>{phrasebook.streamKey}:</th>
							<td>
								<Codette dense={true}>{sensitives.rtmpsKey}</Codette>
							</td>
						</tr>
						<tr>
							<th>{phrasebook.server}:</th>
							<td>
								<Codette>host.bouncing.tv</Codette>
							</td>
						</tr>
					</tbody>
				</table>
			</Card>
		{/if}
		<br />
		<Texticle
			empty={phrasebook.bioEmpty}
			valid={phrasebook.bioValid}
			schema={bioSchema}
			onInput={(v) => (bio = v)}
			onValidation={(v) => (bioValid = v)}
			multiline={true}
			value={channel.bio}
		/>
		<Button onClick={saveChannel} disabled={!savable}>Save</Button>
		<br />
		<ImageUpload
			image={channel.activeBg ??
				channel.awayBg ??
				defaultImages.ActiveChannelBackground}
			channelId={channel.id}
			reason="ActiveChannelBackground"
		>
			{phrasebook.replaceActiveBackground}
		</ImageUpload>
		<ImageUpload
			image={channel.awayBg ??
				channel.activeBg ??
				defaultImages.AwayChannelBackground}
			channelId={channel.id}
			reason="AwayChannelBackground"
		>
			{phrasebook.replaceAwayBackground}
		</ImageUpload>
	{:else}
		{phrasebook.channelNonexistent}
	{/if}
</div>
