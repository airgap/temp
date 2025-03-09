<script lang="ts">
    import { api } from 'monolith-ts-api';
    import styles from './ChatBox.module.sass';
    import MessageItem from './MessageItem.svelte';
    import type { Channel, Message } from '@lyku/json-models';

    const { channel } = $props<{
        channel?: Channel;
    }>();
    let messages = $state<Message[]>();

    $effect(() => {
        if (channel && !messages.length) {
            api.listMessages({ channel: channel.id })
                .then(({ messages: newMessages }) => {
                    messages = newMessages;
                    console.log('messages', messages);
                });
        }
    });
</script>

<div class={styles.ChatBox}>
    <ul class={styles.MessageList}>
        {#if messages}
            {#each messages as msg (msg.id)}
                <MessageItem src={msg} />
            {/each}
        {/if}
    </ul>
</div> 