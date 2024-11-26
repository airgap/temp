import styles from './MessageItem.module.sass';
import { Message } from '@lyku/json-models';

export type Props = {
	src: Message;
};

export const MessageItem = ({ src }: Props) => (
	<li className={styles.MessageItem}>
		<b>{src.author}:&nbsp;</b>
		{src.content}
	</li>
);
