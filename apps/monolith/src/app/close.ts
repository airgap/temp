import { state } from './state';

export const stop = async () => {
	state.httpServer?.close();
	await state.connection?.close();
};
