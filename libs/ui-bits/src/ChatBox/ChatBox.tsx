import { api } from 'monolith-ts-api';
import { useEffect, useState } from 'react';

import styles from './ChatBox.module.sass';
import { MessageItem } from './MessageItem';
import { Channel, Message } from '@lyku/json-models';

export type Props = { channel?: Channel };
export type State = { messages: Message[] };

/**
 * @noInheritDoc
 */
export const ChatBox = (props: Props) => {
	const [messages, setMessages] = useState<Message[]>([]);
	useEffect(() => {
		if (!props.channel) return;
		void api
			.listMessages({ channel: props.channel.id })
			.then(({ messages }) => setMessages(messages));
		console.log('messages', messages);
	}, [props, messages]);
	return (
		<div className={styles.ChatBox}>
			<ul className={styles.MessageList}>
				{messages.map(msg => (
					<MessageItem src={msg} key={msg.id}></MessageItem>
				))}
			</ul>
		</div>
	);
};
