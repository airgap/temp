<script lang="ts">
    import { api } from 'monolith-ts-api';
    import styles from './ChatBox.module.sass';
    import MessageItem from './MessageItem.svelte';
    import type { Channel, Message } from '@lyku/json-models';

    export let channel: Channel | undefined = undefined;
    let messages: Message[] = [];

    $: if (channel) {
        api.listMessages({ channel: channel.id })
            .then(({ messages: newMessages }) => {
                messages = newMessages;
                console.log('messages', messages);
            });
    }
</script>

<div class={styles.ChatBox}>
    <ul class={styles.MessageList}>
        {#each messages as msg (msg.id)}
            <MessageItem src={msg} />
        {/each}
    </ul>
</div> 