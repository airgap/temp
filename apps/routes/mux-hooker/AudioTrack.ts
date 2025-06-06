export type AudioTrack = {
	type: 'audio';
	max_channels: number;
	max_channel_layout: 'mono' | 'stereo';
	id: string;
	duration: number;
};
