import styles from './MessageItem.module.sass';
import { Message } from '@lyku/json-models';

export const MessageItem = ({ src }: { src: Message }) => (
  <li className={styles.MessageItem}>
    <b>{src.author}:&nbsp;</b>
    {src.content}
  </li>
);
