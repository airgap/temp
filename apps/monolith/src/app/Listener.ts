export type Listener = {
	from: string;
	callback: <T>(result: T) => void;
};
