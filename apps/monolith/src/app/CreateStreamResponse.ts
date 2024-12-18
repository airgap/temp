export interface CreateStreamResponse {
	errors: string[];
	messages: string[];
	result: Result;
	success: boolean;
}

export interface Result {
	created: Date;
	meta: Meta;
	modified: Date;
	recording: Recording;
	rtmps: Rtmps;
	rtmpsPlayback: Rtmps;
	srt: Srt;
	srtPlayback: Srt;
	status: null;
	uid: string;
	webRTC: WebRTC;
	webRTCPlayback: WebRTC;
}

export interface Meta {
	name: string;
}

export interface Recording {
	mode: string;
	requireSignedURLs: boolean;
	timeoutSeconds: number;
}

export interface Rtmps {
	streamKey: string;
	url: string;
}

export interface Srt {
	passphrase: string;
	streamId: string;
	url: string;
}

export interface WebRTC {
	url: string;
}
