import { useCacheSingleton } from 'ui-bits';
import styles from './MessageItem.module.sass';
import { Message } from '@lyku/json-models';

export type Props = {
	src: Message;
};

export const MessageItem = ({ src }: Props) => (
	<li className={styles.MessageItem}>
		<b>{useCacheSingleton('users', src.author)[0]?.username}:&nbsp;</b>
		{src.content}
	</li>
);
