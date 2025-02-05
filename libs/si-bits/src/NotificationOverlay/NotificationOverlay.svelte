<script lang="ts">
  import type { Notification } from '@lyku/json-models';
  import styles from './NotificationOverlay.module.sass';
  import { Divisio } from '../Divisio';
  import { Image } from '../Image';
  import { shout } from '../Sonic';
  import { api, sessionId, type ThiccSocket } from 'monolith-ts-api';
  import { onMount } from 'svelte';

  let notifications: Notification[] = [];
  let listener: ThiccSocket<'listenForNotifications'> | undefined;

  // Noti component logic
  function handleNotificationClick(notification: Notification) {
    if (!notification.href) return;
    alert('Coming soon!');
    if (notification.href.startsWith('/achievements/'))
      shout('showAchievement', notification.href.split('/achievements/')[1]);
    else window.location.href = notification.href;
  }

  function removeNotification(notification: Notification) {
    const i = notifications.indexOf(notification);
    notifications = [...notifications.slice(0, i), ...notifications.slice(i + 1)];
  }

  onMount(() => {
    if (sessionId && !listener) {
      const list = api.listenForNotifications();
      listener = list;
      list.listen((noti) => {
        notifications = [...notifications, noti];
      });
    }
  });
</script>

<div class={styles.NotificationOverlay}>
  {#each notifications as notification (notification.id)}
    <button
      class={styles.Notification}
      class:${styles.clickable}={notification.href}
      on:click={() => handleNotificationClick(notification)}
      transition:fade={{ duration: 1000 }}
    >
      <div class={styles.NotificationContent}>
        <Divisio layout="h" size="m">
          <Image url={notification.icon} class={styles.NotificationIcon} />
          <Divisio
            layout="v"
            size="m"
            hang={`+20pts`}
            style="width: calc(100% - 60px)"
          >
            <h3>{notification.title}</h3>
            <p>{notification.body}</p>
          </Divisio>
        </Divisio>
      </div>
    </button>
  {/each}
</div>

<script context="module">
  import { fade } from 'svelte/transition';
</script>

<style>
  /* Add any component-specific styles here */
</style> 