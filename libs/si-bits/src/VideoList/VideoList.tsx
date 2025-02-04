import { api } from 'monolith-ts-api';

import { phrasebook } from '../phrasebook';
import styles from './VideoList.module.sass';
import { Channel } from '@lyku/json-models';
import { Await } from 'awaitx';

type Props = { channel: Channel };

export const VideoList = ({ channel }: Props) => (
	<div>
		<h2>Shelf</h2>
		<Await
			dependencies={[channel.id]}
			source={() => api.listChannelVideos({ channelId: channel.id })}
			fail={(error) => <h1>{String(error)}</h1>}
			then={(videos) => (
				<ul className={styles.VideoList}>
					{videos.map((video) => (
						<li key={video.uid}>
							<img src={video.thumbnail} alt={phrasebook.videoThumbnail} />
						</li>
					))}
				</ul>
			)}
		/>
	</div>
);
