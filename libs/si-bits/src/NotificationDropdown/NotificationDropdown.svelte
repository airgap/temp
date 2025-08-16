<script lang="ts">
	import type { Notification } from '@lyku/json-models';
	import styles from './NotificationDropdown.module.sass';
	import { api, getSessionId } from '@lyku/monolith-ts-api';
	import { onMount } from 'svelte';
	import { Image } from '../Image';
	import { DynamicDate } from '../DynamicDate';
	import bell from '../assets/bell.svg?raw';
	import { notificationStore } from '../CacheProvider';

	let notifications = $derived([...notificationStore.values()]);
	let unreadCount = $derived(notifications.filter((n) => !n.read).length);
	let isOpen = $state(false);
	let dropdownRef: HTMLDivElement;
	$effect(() => {
		console.log('Notification list', notifications);
	});

	// Load notifications from API and listen for new ones
	onMount(() => {
		if (getSessionId()) {
			// Load existing notifications
			loadNotifications();

			// Listen for new notifications
			const listener = api.listenForNotifications({});
			listener.listen((notification) => {
				console.log('New notification:', notification);
				if (notification.id)
					notificationStore.set(notification.id, notification);
			});

			// Close dropdown when clicking outside
			const handleClickOutside = (event: MouseEvent) => {
				if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
					isOpen = false;
				}
			};
			document.addEventListener('click', handleClickOutside);

			return () => {
				document.removeEventListener('click', handleClickOutside);
				listener.close();
			};
		}
	});

	async function loadNotifications() {
		try {
			const response = await api.listNotifications({});
			console.log('Notification response:', response);
			response.notifications.forEach((notification) => {
				notificationStore.set(notification.id, notification);
				console.log('Set notification', notification.id, notification);
			});
		} catch (error) {
			console.error('Failed to load notifications:', error);
		}
	}

	function toggleDropdown() {
		isOpen = !isOpen;
		if (isOpen && unreadCount > 0) {
			// Mark notifications as read when opened
			markAsRead();
		}
	}

	async function markAsRead() {
		try {
			await api.markNotificationsRead({});
			notificationStore.forEach((notification, id) => {
				console.log('notification', id, 'is', notification);
				if (!notification.read) {
					notificationStore.set(id, { ...notification, read: new Date() });
				}
			});
		} catch (error) {
			console.error('Failed to mark notifications as read:', error);
		}
	}

	function handleNotificationClick(notification: Notification) {
		if (notification.href) {
			window.location.href = notification.href;
		}
		isOpen = false;
	}

	function formatNotificationTime(posted: string) {
		const date = new Date(posted);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffHours = diffMs / (1000 * 60 * 60);
		const diffDays = diffMs / (1000 * 60 * 60 * 24);

		if (diffHours < 1) {
			return 'Just now';
		} else if (diffHours < 24) {
			return `${Math.floor(diffHours)}h ago`;
		} else if (diffDays < 7) {
			return `${Math.floor(diffDays)}d ago`;
		} else {
			return date.toLocaleDateString();
		}
	}
</script>

<div class={styles.NotificationDropdown} bind:this={dropdownRef}>
	<button
		class={styles.NotificationButton}
		onclick={toggleDropdown}
		aria-label="Notifications"
	>
		<span class={styles.BellIcon}>
			{@html bell}
		</span>
		{#if unreadCount > 0}
			<span class={styles.Badge}>
				{unreadCount > 99 ? '99+' : unreadCount}
			</span>
		{/if}
	</button>

	{#if isOpen}
		<div class={styles.DropdownContent}>
			<div class={styles.DropdownHeader}>
				<h3>Notifications</h3>
				{#if unreadCount > 0}
					<button class={styles.MarkAllRead} onclick={markAsRead}>
						Mark all read
					</button>
				{/if}
			</div>

			<div class={styles.NotificationList}>
				{#if notifications.length === 0}
					<div class={styles.EmptyState}>
						<p>No notifications yet</p>
					</div>
				{:else}
					{#each notifications.slice(0, 10) as notification (notification.id)}
						<button
							class={styles.NotificationItem}
							class:unread={!notification.read}
							onclick={() => handleNotificationClick(notification)}
						>
							<div class={styles.NotificationIcon}>
								<Image src={notification.icon} alt="Notification icon" />
							</div>
							<div class={styles.NotificationContent}>
								<div class={styles.NotificationTitle}>{notification.title}</div>
								{#if notification.subtitle}
									<div class={styles.NotificationSubtitle}>
										{notification.subtitle}
									</div>
								{/if}
								<div class={styles.NotificationBody}>{notification.body}</div>
								<div class={styles.NotificationTime}>
									{formatNotificationTime(notification.posted)}
								</div>
							</div>
						</button>
					{/each}
				{/if}
			</div>

			{#if notifications.length > 10}
				<div class={styles.DropdownFooter}>
					<a href="/notifications" class={styles.ViewAll}
						>View all notifications</a
					>
				</div>
			{/if}
		</div>
	{/if}
</div>
