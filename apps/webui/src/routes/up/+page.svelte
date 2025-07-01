<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

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

	const { data } = $props<{
		data: {
			metrics: ServiceMetrics[];
			timestamp: number;
			loadTime: number;
			error?: string;
		};
	}>();

	let sortBy = $state<'name' | 'status' | 'uptime' | 'response'>('name');
	let sortDesc = $state(false);
	let filterStatus = $state<'all' | 'up' | 'down'>('all');
	let searchTerm = $state('');

	const filteredMetrics = $derived(
		data.metrics
			.filter((metric) => {
				console.log('metric', metric);
				const matchesStatus =
					filterStatus === 'all' || metric.status === filterStatus;
				const matchesSearch = metric.service
					?.toLowerCase()
					.includes(searchTerm?.toLowerCase());
				return matchesStatus && matchesSearch;
			})
			.sort((a, b) => {
				let comparison = 0;
				switch (sortBy) {
					case 'name':
						comparison = a.service.localeCompare(b.service);
						break;
					case 'status':
						comparison = a.status.localeCompare(b.status);
						break;
					case 'uptime':
						console.log('st', a.uptimeStats, b.uptimeStats);
						comparison = a.uptimeStats.uptime24h - b.uptimeStats.uptime24h;
						break;
					case 'response':
						comparison = a.responseTime - b.responseTime;
						break;
				}
				return sortDesc ? -comparison : comparison;
			}),
	);

	const overallStats = $derived({
		total: data.metrics.length,
		up: data.metrics.filter((m) => m.status === 'up').length,
		down: data.metrics.filter((m) => m.status === 'down').length,
		avgUptime:
			data.metrics.length > 0
				? data.metrics.reduce((sum, m) => sum + m.uptimeStats.uptime24h, 0) /
					data.metrics.length
				: 0,
		totalIncidents: data.metrics.reduce(
			(sum, m) => sum + m.uptimeStats.incidents24h,
			0,
		),
	});

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

	function sort(column: typeof sortBy) {
		if (sortBy === column) {
			sortDesc = !sortDesc;
		} else {
			sortBy = column;
			sortDesc = false;
		}
	}

	// Auto-refresh every 30 seconds
	onMount(() => {
		if (browser) {
			const interval = setInterval(() => {
				window.location.reload();
			}, 30000);
			return () => clearInterval(interval);
		}
	});
	$effect(() => console.log('data', data));
	$inspect(data);
</script>

<svelte:head>
	<title>Service Uptime Dashboard - Lyku</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 p-6">
	<div class="max-w-7xl mx-auto">
		<!-- Header -->
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-gray-900 mb-2">
				Service Uptime Dashboard
			</h1>
			<p class="text-gray-600">
				Monitoring {data.metrics.length} services • Last updated {timeAgo(
					data.timestamp,
				)}
			</p>
		</div>

		{#if data.error}
			<div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
				<p class="text-red-800">Error loading metrics: {data.error}</p>
			</div>
		{/if}

		<!-- Overview Stats -->
		<div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
			<div class="bg-white rounded-lg shadow p-6">
				<h3 class="text-sm font-medium text-gray-500">Total Services</h3>
				<p class="text-2xl font-bold text-gray-900">{overallStats.total}</p>
			</div>
			<div class="bg-white rounded-lg shadow p-6">
				<h3 class="text-sm font-medium text-gray-500">Services Up</h3>
				<p class="text-2xl font-bold text-green-600">{overallStats.up}</p>
			</div>
			<div class="bg-white rounded-lg shadow p-6">
				<h3 class="text-sm font-medium text-gray-500">Services Down</h3>
				<p class="text-2xl font-bold text-red-600">{overallStats.down}</p>
			</div>
			<div class="bg-white rounded-lg shadow p-6">
				<h3 class="text-sm font-medium text-gray-500">Avg Uptime (24h)</h3>
				<p class="text-2xl font-bold {getUptimeColor(overallStats.avgUptime)}">
					{formatUptime(overallStats.avgUptime)}
				</p>
			</div>
			<div class="bg-white rounded-lg shadow p-6">
				<h3 class="text-sm font-medium text-gray-500">Incidents (24h)</h3>
				<p class="text-2xl font-bold text-orange-600">
					{overallStats.totalIncidents}
				</p>
			</div>
		</div>

		<!-- Filters -->
		<div class="bg-white rounded-lg shadow p-6 mb-6">
			<div class="flex flex-wrap gap-4">
				<div>
					<label
						for="search"
						class="block text-sm font-medium text-gray-700 mb-1">Search</label
					>
					<input
						type="text"
						id="search"
						bind:value={searchTerm}
						placeholder="Filter services..."
						class="border border-gray-300 rounded-md px-3 py-2 w-64"
					/>
				</div>
				<div>
					<label
						for="status-filter"
						class="block text-sm font-medium text-gray-700 mb-1">Status</label
					>
					<select
						id="status-filter"
						bind:value={filterStatus}
						class="border border-gray-300 rounded-md px-3 py-2"
					>
						<option value="all">All</option>
						<option value="up">Up</option>
						<option value="down">Down</option>
					</select>
				</div>
			</div>
		</div>

		<!-- Services Table -->
		<div class="bg-white rounded-lg shadow overflow-hidden">
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
							onclick={() => sort('name')}
						>
							Service {sortBy === 'name' ? (sortDesc ? '↓' : '↑') : ''}
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
							onclick={() => sort('status')}
						>
							Status {sortBy === 'status' ? (sortDesc ? '↓' : '↑') : ''}
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
							onclick={() => sort('uptime')}
						>
							Uptime (24h) {sortBy === 'uptime' ? (sortDesc ? '↓' : '↑') : ''}
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
							onclick={() => sort('response')}
						>
							Response Time {sortBy === 'response'
								? sortDesc
									? '↓'
									: '↑'
								: ''}
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
						>
							Memory
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
						>
							Requests/sec
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
						>
							Error Rate
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
						>
							Incidents
						</th>
					</tr>
				</thead>
				<tbody class="bg-white divide-y divide-gray-200">
					{#each filteredMetrics as metric}
						<tr class="hover:bg-gray-50">
							<td class="px-6 py-4 whitespace-nowrap">
								<a
									href="/up/{metric.service}"
									class="text-blue-600 hover:text-blue-800 font-medium"
								>
									{metric.service}
								</a>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<span
									class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {metric.status ===
									'up'
										? 'bg-green-100 text-green-800'
										: 'bg-red-100 text-red-800'}"
								>
									{metric.status.toUpperCase()}
								</span>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<span
									class="font-medium {getUptimeColor(
										metric.uptimeStats.uptime24h,
									)}"
								>
									{formatUptime(metric.uptimeStats.uptime24h)}
								</span>
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-gray-900">
								{formatResponseTime(metric.responseTime)}
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-gray-900">
								{formatMemory(metric.memoryUsage)}
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-gray-900">
								{metric.requestRate.toFixed(1)}
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<span
									class={metric.errorRate > 0.05
										? 'text-red-600'
										: 'text-gray-900'}
								>
									{(metric.errorRate * 100).toFixed(2)}%
								</span>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<span class="text-sm text-gray-900">
									{metric.uptimeStats.incidents24h}
								</span>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		{#if filteredMetrics.length === 0 && data.metrics.length > 0}
			<div class="text-center py-8 text-gray-500">
				No services match your filters.
			</div>
		{/if}

		<!-- Footer -->
		<div class="mt-8 text-center text-sm text-gray-500">
			<p>Auto-refreshes every 30 seconds • Load time: {data.loadTime}ms</p>
		</div>
	</div>
</div>

<style>
	/* Custom scrollbar for better UX */
	:global(body) {
		scrollbar-width: thin;
		scrollbar-color: #cbd5e0 #f7fafc;
	}

	:global(body::-webkit-scrollbar) {
		width: 8px;
	}

	:global(body::-webkit-scrollbar-track) {
		background: #f7fafc;
	}

	:global(body::-webkit-scrollbar-thumb) {
		background: #cbd5e0;
		border-radius: 4px;
	}
</style>
