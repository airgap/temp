import { Logger } from '@lyku/logger';

/**
 * Metric types supported by the metrics system
 */
export enum MetricType {
	COUNTER = 'counter',
	GAUGE = 'gauge',
	HISTOGRAM = 'histogram',
	SUMMARY = 'summary',
}

/**
 * Interface for metric labels
 */
export type MetricLabels = Record<string, string | number | boolean>;

/**
 * Configuration for metrics client
 */
export interface MetricsClientConfig {
	/**
	 * Service name to prefix metrics
	 */
	serviceName: string;

	/**
	 * Environment (e.g., production, staging, development)
	 */
	environment: string;

	/**
	 * Additional default labels to add to all metrics
	 */
	defaultLabels?: MetricLabels;

	/**
	 * Whether to log metrics to console (useful for development)
	 */
	logMetrics?: boolean;
}

/**
 * Abstract interface for metrics backends
 */
export interface MetricsBackend {
	/**
	 * Increment a counter
	 */
	incrementCounter(name: string, value?: number, labels?: MetricLabels): void;

	/**
	 * Record a gauge value
	 */
	recordGauge(name: string, value: number, labels?: MetricLabels): void;

	/**
	 * Record a histogram value
	 */
	recordHistogram(name: string, value: number, labels?: MetricLabels): void;

	/**
	 * Record a summary value
	 */
	recordSummary(name: string, value: number, labels?: MetricLabels): void;

	/**
	 * Start a timer
	 */
	startTimer(name: string, labels?: MetricLabels): () => void;

	/**
	 * Get metrics data for scraping
	 */
	getMetrics(): Promise<string>;
}

/**
 * Prometheus-compatible metrics backend
 */
export class PrometheusBackend implements MetricsBackend {
	private counters: Map<string, { value: number; labels: string }> = new Map();
	private gauges: Map<string, { value: number; labels: string }> = new Map();
	private histograms: Map<
		string,
		{ buckets: Map<number, number>; sum: number; count: number; labels: string }
	> = new Map();
	private summaries: Map<string, { values: number[]; labels: string }> =
		new Map();
	private timers: Map<string, { startTime: number; labels: string }> =
		new Map();

	constructor(
		private config: MetricsClientConfig,
		private logger: Logger,
	) {}

	/**
	 * Get a metric key including labels
	 */
	private getKey(name: string, labels: MetricLabels = {}): string {
		const allLabels = { ...this.config.defaultLabels, ...labels };
		const labelString = Object.entries(allLabels)
			.map(([k, v]) => `${k}="${v}"`)
			.join(',');

		return labelString ? `${name}{${labelString}}` : name;
	}

	/**
	 * Increment a counter
	 */
	incrementCounter(name: string, value = 1, labels: MetricLabels = {}): void {
		const key = this.getKey(name, labels);
		const current = this.counters.get(key) || {
			value: 0,
			labels: JSON.stringify(labels),
		};
		current.value += value;
		this.counters.set(key, current);

		if (this.config.logMetrics) {
			this.logger.debug(`Incremented counter ${name}`, { value, labels });
		}
	}

	/**
	 * Record a gauge value
	 */
	recordGauge(name: string, value: number, labels: MetricLabels = {}): void {
		const key = this.getKey(name, labels);
		this.gauges.set(key, { value, labels: JSON.stringify(labels) });

		if (this.config.logMetrics) {
			this.logger.debug(`Recorded gauge ${name}`, { value, labels });
		}
	}

	/**
	 * Record a histogram value
	 */
	recordHistogram(
		name: string,
		value: number,
		labels: MetricLabels = {},
	): void {
		const key = this.getKey(name, labels);
		const current = this.histograms.get(key) || {
			buckets: new Map([
				[0.005, 0],
				[0.01, 0],
				[0.025, 0],
				[0.05, 0],
				[0.1, 0],
				[0.25, 0],
				[0.5, 0],
				[1, 0],
				[2.5, 0],
				[5, 0],
				[10, 0],
				[Infinity, 0],
			]),
			sum: 0,
			count: 0,
			labels: JSON.stringify(labels),
		};

		// Update buckets
		for (const [bucketUpper, count] of current.buckets) {
			if (value <= bucketUpper) {
				current.buckets.set(bucketUpper, count + 1);
			}
		}

		current.sum += value;
		current.count += 1;
		this.histograms.set(key, current);

		if (this.config.logMetrics) {
			this.logger.debug(`Recorded histogram ${name}`, { value, labels });
		}
	}

	/**
	 * Record a summary value
	 */
	recordSummary(name: string, value: number, labels: MetricLabels = {}): void {
		const key = this.getKey(name, labels);
		const current = this.summaries.get(key) || {
			values: [],
			labels: JSON.stringify(labels),
		};

		current.values.push(value);

		// Keep only most recent 1000 values
		if (current.values.length > 1000) {
			current.values.shift();
		}

		this.summaries.set(key, current);

		if (this.config.logMetrics) {
			this.logger.debug(`Recorded summary ${name}`, { value, labels });
		}
	}

	/**
	 * Start a timer
	 */
	startTimer(name: string, labels: MetricLabels = {}): () => void {
		const key = this.getKey(name, labels);
		const startTime = process.hrtime.bigint();

		this.timers.set(key, {
			startTime: Number(startTime),
			labels: JSON.stringify(labels),
		});

		return () => {
			const endTime = process.hrtime.bigint();
			const durationMs =
				Number(endTime - BigInt(this.timers.get(key)?.startTime || 0)) /
				1000000;
			this.recordHistogram(name, durationMs, labels);
			this.timers.delete(key);

			if (this.config.logMetrics) {
				this.logger.debug(`Timer completed ${name}`, { durationMs, labels });
			}
		};
	}

	/**
	 * Get metrics data for scraping
	 */
	async getMetrics(): Promise<string> {
		const lines: string[] = [];

		// Add counters
		for (const [key, { value }] of this.counters.entries()) {
			const name = key.split('{')[0];
			lines.push(`# TYPE ${name} counter`);
			lines.push(`${key} ${value}`);
		}

		// Add gauges
		for (const [key, { value }] of this.gauges.entries()) {
			const name = key.split('{')[0];
			lines.push(`# TYPE ${name} gauge`);
			lines.push(`${key} ${value}`);
		}

		// Add histograms
		const histogramNames = new Set<string>();
		for (const [key, { buckets, sum, count }] of this.histograms.entries()) {
			const name = key.split('{')[0];
			if (!histogramNames.has(name)) {
				lines.push(`# TYPE ${name} histogram`);
				histogramNames.add(name);
			}

			let cumulativeCount = 0;
			for (const [bucketUpper, bucketCount] of buckets.entries()) {
				cumulativeCount += bucketCount;
				const bucketKey = key.replace(
					/}$/,
					`,le="${bucketUpper === Infinity ? '+Inf' : bucketUpper}"}`,
				);
				lines.push(
					`${name}_bucket${bucketKey.substring(name.length)} ${cumulativeCount}`,
				);
			}

			lines.push(`${name}_sum${key.substring(name.length)} ${sum}`);
			lines.push(`${name}_count${key.substring(name.length)} ${count}`);
		}

		// Add summaries
		const summaryNames = new Set<string>();
		for (const [key, { values }] of this.summaries.entries()) {
			const name = key.split('{')[0];
			if (!summaryNames.has(name)) {
				lines.push(`# TYPE ${name} summary`);
				summaryNames.add(name);
			}

			if (values.length === 0) continue;

			// Sort values for percentile calculation
			const sortedValues = [...values].sort((a, b) => a - b);
			const sum = sortedValues.reduce((a, b) => a + b, 0);
			const count = sortedValues.length;

			const quantiles = [
				{ q: 0.5, v: sortedValues[Math.floor(count * 0.5)] },
				{ q: 0.9, v: sortedValues[Math.floor(count * 0.9)] },
				{ q: 0.95, v: sortedValues[Math.floor(count * 0.95)] },
				{ q: 0.99, v: sortedValues[Math.floor(count * 0.99)] },
			];

			for (const { q, v } of quantiles) {
				const quantileKey = key.replace(/}$/, `,quantile="${q}"}`);
				lines.push(`${name}${quantileKey.substring(name.length)} ${v}`);
			}

			lines.push(`${name}_sum${key.substring(name.length)} ${sum}`);
			lines.push(`${name}_count${key.substring(name.length)} ${count}`);
		}

		return lines.join('\n');
	}
}

/**
 * Client for recording metrics
 */
export class MetricsClient implements MetricsBackend {
	private backend: MetricsBackend;

	constructor(
		private config: MetricsClientConfig,
		private logger: Logger,
		backend?: MetricsBackend,
	) {
		this.backend = backend || new PrometheusBackend(config, logger);

		if (config.logMetrics) {
			this.logger.info('Initialized metrics client', {
				serviceName: config.serviceName,
				environment: config.environment,
			});
		}
	}

	/**
	 * Add service prefix to metric name
	 */
	private prefixName(name: string): string {
		return `${this.config.serviceName}_${name}`;
	}

	/**
	 * Increment a counter
	 */
	incrementCounter(name: string, value = 1, labels: MetricLabels = {}): void {
		this.backend.incrementCounter(this.prefixName(name), value, labels);
	}

	/**
	 * Record a gauge value
	 */
	recordGauge(name: string, value: number, labels: MetricLabels = {}): void {
		this.backend.recordGauge(this.prefixName(name), value, labels);
	}

	/**
	 * Record a histogram value
	 */
	recordHistogram(
		name: string,
		value: number,
		labels: MetricLabels = {},
	): void {
		this.backend.recordHistogram(this.prefixName(name), value, labels);
	}

	/**
	 * Record a summary value
	 */
	recordSummary(name: string, value: number, labels: MetricLabels = {}): void {
		this.backend.recordSummary(this.prefixName(name), value, labels);
	}

	/**
	 * Start a timer
	 */
	startTimer(name: string, labels: MetricLabels = {}): () => void {
		return this.backend.startTimer(this.prefixName(name), labels);
	}

	/**
	 * Time a function execution
	 */
	timeFunction<T>(
		name: string,
		fn: () => Promise<T>,
		labels: MetricLabels = {},
	): Promise<T> {
		const end = this.startTimer(name, labels);

		return Promise.resolve()
			.then(() => fn())
			.finally(() => end());
	}

	/**
	 * Get metrics data for scraping
	 */
	async getMetrics(): Promise<string> {
		return this.backend.getMetrics();
	}
}

/**
 * Create a metrics client instance
 */
export function createMetricsClient(
	config: MetricsClientConfig,
	logger: Logger,
): MetricsClient {
	return new MetricsClient(config, logger);
}
