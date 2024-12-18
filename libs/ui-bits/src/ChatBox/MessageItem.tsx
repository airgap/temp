import { useCacheSingleton } from '../CacheProvider/CacheProvider';
import styles from './MessageItem.module.sass';
import { Message, User } from '@lyku/json-models';

export const MessageItem = ({ src }: { src: Message }) => (
	<li className={styles.MessageItem}>
		<b>{useCacheSingleton('users', src.author)[0]?.username ?? '-'}:&nbsp;</b>
		{src.content}
	</li>
);
