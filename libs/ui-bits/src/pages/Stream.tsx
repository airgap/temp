import { ChatBox } from '../ChatBox';
import { VideoList } from '../VideoList';
import { Fof } from '../Fof';
import { Tv } from '../Tv';
import { TvBox } from '../TvBox';
import { api } from 'monolith-ts-api';
import { Await } from 'awaitx';

export const Stream = () => {
	const channelName = window.location.pathname.substring(1);
	return (
		<Await
			source={() => api.getChannel({ name: channelName })}
			then={channel => (
				<>
					<TvBox>
						<Tv channel={channel}>
							<Fof>{channel?.name ?? 'LYKU'}</Fof>
						</Tv>
					</TvBox>
					<ChatBox channel={channel}></ChatBox>
					<br />
					{channel && <VideoList channel={channel} />}
				</>
			)}
		/>
	);
};
