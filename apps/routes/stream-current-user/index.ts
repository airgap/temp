import { handleStreamCurrentUser } from '@lyku/handles';
import { onEach } from '@lyku/helpers';

export default handleStreamCurrentUser((_, { requester, emit }) => {
	const sub = nats.subscribe(`users.${requester}`);
	onEach(sub, (msg) => emit(msg.data));
	return sub.unsubscribe;
});
