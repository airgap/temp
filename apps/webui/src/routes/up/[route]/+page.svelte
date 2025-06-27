<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	interface UptimeStats {
		uptime24h: number;
		uptime7d: number;
		uptime30d: number;
		uptime90d: number;
		incidents24h: number;
		incidents7d: number;
		incidents30d: number;
		averageResponseTime24h: number;
		averageResponseTime7d: number;
	}

	interface ServiceMetrics {
		service: string;
		status: 'up' | 'down';
		requestRate: number;
		errorRate: number;
		responseTime: number;
		memoryUsage: number;
		inFlightRequests: number;
		lastUpdated: number;
		uptimeStats: UptimeStats;
	}

	interface UptimeHistoryPoint {
		date: string;
		uptime: number;
		incidents: number;
	}

	interface ResponseTimeHistoryPoint {
		hour: string;
		responseTime: number;
	}

	const { data } = $props<{
		data: {
			service: ServiceMetrics;
			allMetrics: ServiceMetrics[];
			uptimeHistory: UptimeHistoryPoint[];
			responseTimeHistory: ResponseTimeHistoryPoint[];
			timestamp: number;
			loadTime: number;
		};
	}>();

	function formatUptime(uptime: number): string {
		return uptime.toFixed(2) + '%';
	}

	function formatResponseTime(time: number): string {
		return time > 0 ? time.toFixed(0) + 'ms' : 'N/A';
	}

	function formatMemory(bytes: number): string {
		if (bytes === 0) return 'N/A';
		const mb = bytes / 1024 / 1024;
		return mb > 1024 ? (mb / 1024).toFixed(1) + 'GB' : mb.toFixed(0) + 'MB';
	}

	function formatDuration(ms: number): string {
		const seconds = Math.floor(ms / 1000);
		const minutes = Math.floor(seconds / 60);
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);

		if (days > 0) return `${days}d ${hours % 24}h`;
		if (hours > 0) return `${hours}h ${minutes % 60}m`;
		if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
		return `${seconds}s`;
	}

	function getStatusColor(status: string): string {
		return status === 'up' ? 'text-green-600' : 'text-red-600';
	}

	function getUptimeColor(uptime: number): string {
		if (uptime >= 99.9) return 'text-green-600';
		if (uptime >= 99.0) return 'text-yellow-600';
		return 'text-red-600';
	}

	function timeAgo(timestamp: number): string {
		const seconds = Math.floor((Date.now() - timestamp) / 1000);
		if (seconds < 60) return `${seconds}s ago`;
		if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
		if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
		return `${Math.floor(seconds / 86400)}d ago`;
	}

	const serviceName = $derived(data.service.service);
	const uptime = $derived(
		data.service.lastUpdated > 0 ? Date.now() - data.service.lastUpdated : 0,
	);

	// Auto-refresh every 30 seconds
	onMount(() => {
		if (browser) {
			const interval = setInterval(() => {
				window.location.reload();
			}, 30000);
			return () => clearInterval(interval);
		}
	});
</script>

<svelte:head>
	<title>{serviceName} - Service Details - Lyku</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 p-6">
	<div class="max-w-7xl mx-auto">
		<!-- Header -->
		<div class="mb-8">
			<nav class="text-sm text-gray-500 mb-4">
				<a href="/up" class="hover:text-gray-700">Uptime Dashboard</a>
				<span class="mx-2">/</span>
				<span class="text-gray-900">{serviceName}</span>
			</nav>
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-3xl font-bold text-gray-900 mb-2">{serviceName}</h1>
					<p class="text-gray-600">
						Last updated {timeAgo(data.timestamp)} • Load time: {data.loadTime}ms
					</p>
				</div>
				<div class="text-right">
					<div
						class="inline-flex items-center px-4 py-2 rounded-full text-lg font-medium {data
							.service.status === 'up'
							? 'bg-green-100 text-green-800'
							: 'bg-red-100 text-red-800'}"
					>
						<div
							class="w-3 h-3 rounded-full mr-2 {data.service.status === 'up'
								? 'bg-green-500'
								: 'bg-red-500'}"
						></div>
						{data.service.status.toUpperCase()}
					</div>
				</div>
			</div>
		</div>

		<!-- Key Metrics -->
		<div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
			<div class="bg-white rounded-lg shadow p-6">
				<h3 class="text-sm font-medium text-gray-500 mb-2">Uptime (24h)</h3>
				<p
					class="text-3xl font-bold {getUptimeColor(
						data.service.uptimeStats.uptime24h,
					)}"
				>
					{formatUptime(data.service.uptimeStats.uptime24h)}
				</p>
				<p class="text-sm text-gray-500 mt-1">
					{data.service.uptimeStats.incidents24h} incidents
				</p>
			</div>
			<div class="bg-white rounded-lg shadow p-6">
				<h3 class="text-sm font-medium text-gray-500 mb-2">Response Time</h3>
				<p class="text-3xl font-bold text-blue-600">
					{formatResponseTime(data.service.responseTime)}
				</p>
				<p class="text-sm text-gray-500 mt-1">
					Avg: {formatResponseTime(
						data.service.uptimeStats.averageResponseTime24h,
					)}
				</p>
			</div>
			<div class="bg-white rounded-lg shadow p-6">
				<h3 class="text-sm font-medium text-gray-500 mb-2">Request Rate</h3>
				<p class="text-3xl font-bold text-purple-600">
					{data.service.requestRate.toFixed(1)}/s
				</p>
				<p class="text-sm text-gray-500 mt-1">
					{data.service.inFlightRequests} in-flight
				</p>
			</div>
			<div class="bg-white rounded-lg shadow p-6">
				<h3 class="text-sm font-medium text-gray-500 mb-2">Error Rate</h3>
				<p
					class="text-3xl font-bold {data.service.errorRate > 0.05
						? 'text-red-600'
						: 'text-green-600'}"
				>
					{(data.service.errorRate * 100).toFixed(2)}%
				</p>
				<p class="text-sm text-gray-500 mt-1">
					Memory: {formatMemory(data.service.memoryUsage)}
				</p>
			</div>
		</div>

		<!-- Uptime History Chart -->
		<div class="bg-white rounded-lg shadow p-6 mb-8">
			<h3 class="text-lg font-medium text-gray-900 mb-4">
				30-Day Uptime History
			</h3>
			<div class="grid grid-cols-30 gap-1">
				{#each data.uptimeHistory as point}
					<div class="group relative">
						<div
							class="h-8 rounded-sm cursor-pointer {point.uptime >= 99.9
								? 'bg-green-500'
								: point.uptime >= 99.0
									? 'bg-yellow-500'
									: 'bg-red-500'}"
							title="{point.date}: {formatUptime(point.uptime)}"
						></div>
						<div
							class="absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-10 hidden group-hover:block"
						>
							<div
								class="bg-black text-white text-xs rounded py-1 px-2 whitespace-nowrap"
							>
								{point.date}<br />
								{formatUptime(point.uptime)}<br />
								{point.incidents} incidents
							</div>
						</div>
					</div>
				{/each}
			</div>
			<div class="flex justify-between text-xs text-gray-500 mt-2">
				<span>30 days ago</span>
				<span>Today</span>
			</div>
			<div class="flex items-center justify-center mt-4 space-x-6 text-sm">
				<div class="flex items-center">
					<div class="w-3 h-3 bg-green-500 rounded-sm mr-2"></div>
					<span>≥99.9% uptime</span>
				</div>
				<div class="flex items-center">
					<div class="w-3 h-3 bg-yellow-500 rounded-sm mr-2"></div>
					<span>99.0-99.9% uptime</span>
				</div>
				<div class="flex items-center">
					<div class="w-3 h-3 bg-red-500 rounded-sm mr-2"></div>
					<span>&lt;99.0% uptime</span>
				</div>
			</div>
		</div>

		<!-- Response Time Chart -->
		<div class="bg-white rounded-lg shadow p-6 mb-8">
			<h3 class="text-lg font-medium text-gray-900 mb-4">
				24-Hour Response Time
			</h3>
			<div class="h-48 flex items-end space-x-1">
				{#each data.responseTimeHistory as point}
					{@const maxTime = Math.max(
						...data.responseTimeHistory.map((p) => p.responseTime),
					)}
					{@const height = (point.responseTime / maxTime) * 100}
					<div class="group relative flex-1">
						<div
							class="bg-blue-500 rounded-t cursor-pointer hover:bg-blue-600 transition-colors"
							style="height: {height}%"
							title="{point.hour}: {formatResponseTime(point.responseTime)}"
						></div>
						<div
							class="absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-48 hidden group-hover:block"
						>
							<div
								class="bg-black text-white text-xs rounded py-1 px-2 whitespace-nowrap"
							>
								{point.hour}<br />
								{formatResponseTime(point.responseTime)}
							</div>
						</div>
					</div>
				{/each}
			</div>
			<div class="flex justify-between text-xs text-gray-500 mt-2">
				<span>24h ago</span>
				<span>Now</span>
			</div>
		</div>

		<!-- Detailed Stats -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
			<!-- Uptime Stats -->
			<div class="bg-white rounded-lg shadow p-6">
				<h3 class="text-lg font-medium text-gray-900 mb-4">
					Uptime Statistics
				</h3>
				<div class="space-y-4">
					<div class="flex justify-between">
						<span class="text-gray-600">Last 24 hours</span>
						<span
							class="font-medium {getUptimeColor(
								data.service.uptimeStats.uptime24h,
							)}"
						>
							{formatUptime(data.service.uptimeStats.uptime24h)}
						</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-600">Last 7 days</span>
						<span
							class="font-medium {getUptimeColor(
								data.service.uptimeStats.uptime7d,
							)}"
						>
							{formatUptime(data.service.uptimeStats.uptime7d)}
						</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-600">Last 30 days</span>
						<span
							class="font-medium {getUptimeColor(
								data.service.uptimeStats.uptime30d,
							)}"
						>
							{formatUptime(data.service.uptimeStats.uptime30d)}
						</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-600">Last 90 days</span>
						<span
							class="font-medium {getUptimeColor(
								data.service.uptimeStats.uptime90d,
							)}"
						>
							{formatUptime(data.service.uptimeStats.uptime90d)}
						</span>
					</div>
				</div>
			</div>

			<!-- Incident Stats -->
			<div class="bg-white rounded-lg shadow p-6">
				<h3 class="text-lg font-medium text-gray-900 mb-4">Incident History</h3>
				<div class="space-y-4">
					<div class="flex justify-between">
						<span class="text-gray-600">Last 24 hours</span>
						<span class="font-medium text-red-600">
							{data.service.uptimeStats.incidents24h} incidents
						</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-600">Last 7 days</span>
						<span class="font-medium text-orange-600">
							{data.service.uptimeStats.incidents7d} incidents
						</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-600">Last 30 days</span>
						<span class="font-medium text-orange-600">
							{data.service.uptimeStats.incidents30d} incidents
						</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-600">Avg Response (24h)</span>
						<span class="font-medium text-blue-600">
							{formatResponseTime(
								data.service.uptimeStats.averageResponseTime24h,
							)}
						</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Back to Dashboard -->
		<div class="mt-8 text-center">
			<a
				href="/up"
				class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
			>
				← Back to Dashboard
			</a>
		</div>

		<!-- Auto-refresh notice -->
		<div class="mt-4 text-center text-sm text-gray-500">
			<p>Auto-refreshes every 30 seconds</p>
		</div>
	</div>
</div>

<style>
	.grid-cols-30 {
		grid-template-columns: repeat(30, minmax(0, 1fr));
	}
</style>
