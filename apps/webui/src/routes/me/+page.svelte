<script lang="ts">
	import {
		BotListWithCreator,
		Center,
		ChannelListWithCreator,
		Divisio,
		ImageUpload,
		phrasebook,
		shout,
		userStore,
	} from '@lyku/si-bits';

	import styles from './Profile.module.sass';

	function handleUpload(id: string) {
		shout('profilePictureChanged', id);
		window.location.reload();
	}
</script>

{#if userStore.get(-1n)}
	<Center>
		<Divisio size="m" layout="v">
			<Divisio size="m" layout="h">
				<div class={styles.uploader}>
					<ImageUpload
						shape="squircle"
						reason="ProfilePicture"
						image={userStore.get(-1n)?.profilePicture}
						onUpload={handleUpload}
					/>
				</div>
				<Divisio size="m" layout="v">
					<h1>{userStore.get(-1n)?.username ?? 'User'}</h1>
					<p>{phrasebook.bioWip}</p>
				</Divisio>
			</Divisio>
			<Center>
				<h2>{phrasebook.myBots}</h2>
			</Center>
			<BotListWithCreator />
			<Center>
				<h2>{phrasebook.channelListTitle}</h2>
			</Center>
			<ChannelListWithCreator />
		</Divisio>
	</Center>
{/if}
