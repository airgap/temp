<script lang="ts">
	import { api } from '@lyku/monolith-ts-api';
	import { phrasebook } from '../phrasebook';
	import styles from './VideoList.module.sass';
	import type { Channel, ListChannelVideosResponse } from '@lyku/json-models';

	const { channel } = $props<{ channel: Channel }>();

	const loadVideos = () => api.listChannelVideos({ channelId: channel.id });

	let videosPromise: ListChannelVideosResponse | undefined = $state(undefined);

	$effect(() => {
		if (channel.id) {
			videosPromise = loadVideos();
		}
	});
</script>

<div>
	<h2>Shelf</h2>
	{#await videosPromise}
		<p>Loading...</p>
	{:then videos}
		<ul class={styles.VideoList}>
			{#each videos as video (video.uid)}
				<li>
					<img src={video.thumbnail} alt={phrasebook.videoThumbnail} />
				</li>
			{/each}
		</ul>
	{:catch error}
		<h1>{error}</h1>
	{/await}
</div>
