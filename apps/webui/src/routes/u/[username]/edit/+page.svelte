<script lang="ts">
	import {
		BotListWithCreator,
		Center,
		ChannelListWithCreator,
		Divisio,
		PfpUpload,
		phrasebook,
		shout,
		userStore,
		me,
	} from '@lyku/si-bits';
	import type { User } from '@lyku/json-models';

	import styles from './Profile.module.sass';
	import { page } from '$app/state';
	const username = page.params.username;
	const slug = username?.toLocaleLowerCase();
	console.log('username', username);
	const { data } = $props<{
		data:
			| {
					user: User;
			  }
			| { error: string };
	}>();

	const { user } = data;
	if (user) userStore.set(-1n, user);

	function handleUpload(id: string) {
		shout('profilePictureChanged', id);
		window.location.reload();
	}
</script>

{#if me()}
	{#if me().slug !== slug}
		<h2>You can only edit your own profile</h2>
	{:else}
		<Center>
			<Divisio size="m" layout="v">
				<Divisio size="m" layout="h">
					<div class={styles.uploader}>
						<PfpUpload image={me()?.profilePicture} onUpload={handleUpload} />
					</div>
					<Divisio size="m" layout="v">
						<h1>{me()?.username ?? 'User'}</h1>
						<p>{phrasebook.bioWip}</p>
					</Divisio>
				</Divisio>
				<Center>
					<h2>{phrasebook.myBots}</h2>
				</Center>
				<BotListWithCreator />
				<!-- <Center>
					<h2>{phrasebook.channelListTitle}</h2>
				</Center>
				<ChannelListWithCreator /> -->
			</Divisio>
		</Center>
	{/if}
{/if}
