import { AudioTrack } from './AudioTrack';
import { VideoTrack } from './VideoTrack';

export type ReadyEvent = {
	type: 'video.asset.ready';
	object: {
		type: 'asset';
		id: string;
	};
	id: string;
	environment: {
		name: string;
		id: string;
	};
	data: {
		tracks: [VideoTrack, AudioTrack];
		status: 'ready';
		max_stored_resolution: 'SD' | 'HD' | '4K';
		max_stored_frame_rate: number;
		id: string;
		duration: number;
		created_at: string;
		aspect_ratio: string;
		resolution_tier: '720p';
		passthrough?: string;
		progress?: {
			state: 'completed' | string;
			progress: number;
		};
		playback_ids: {
			policy: 'private' | 'public';
			id: string;
		}[];
	};
	created_at: string;
	accessor_source: null;
	accessor: null;
	request_id: null;
};
