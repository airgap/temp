import {
	ElasticLeaderboardService,
	sendNotification,
	grantPointsToUser,
} from '@lyku/route-helpers';
import { client as pg } from '@lyku/postgres-client';
import { client as redis } from '@lyku/redis-client';
import { createMetricsClient } from '@lyku/metrics';
import { RedisLock } from '@lyku/locker';
import { Kysely } from 'kysely';
import type { Database } from '@lyku/db-types';
import { DateTime } from 'luxon';

export type LeaderboardAwarderServiceConfig = {
	serviceName: string;
	environment: string;
	redisUrl: string;
	postgresUrl: string;
	enableRecovery: boolean;
	enableMonitoring: boolean;
	checkIntervalMs: number;
	healthCheckIntervalMs: number;
	k8sEnabled: boolean;
};

/**
 * Leaderboard Awarder Service
 *
 * Scans leaderboards daily at 12:05AM EST and awards points to top scorers:
 * - Daily #1: 500 points
 * - Weekly #1: 2000 points
 * - Monthly #1: 5000 points
 * - Yearly #1: 1500 points
 */
export class LeaderboardAwarderService {
	private pg?: Kysely<Database>;
	private redis!: typeof redis;
	private metrics!: ReturnType<typeof createMetricsClient>;
	private logger!: typeof console;
	private isShuttingDown = false;
	private checkInterval: NodeJS.Timeout | null = null;
	private healthCheckInterval: NodeJS.Timeout | null = null;

	constructor(private config: LeaderboardAwarderServiceConfig) {}

	/**
	 * Initialize the service
	 */
	async initialize(): Promise<void> {
		console.log('Initializing Leaderboard Awarder Service');

		this.logger = console;
		this.logger.info('Initializing Leaderboard Awarder Service', {
			config: this.config,
		});

		this.pg = pg;
		this.redis = redis;

		this.metrics = createMetricsClient(
			{
				serviceName: this.config.serviceName,
				environment: this.config.environment,
				defaultLabels: {
					service: this.config.serviceName,
					environment: this.config.environment,
					component: 'leaderboard-awarder',
				},
				logMetrics: this.config.environment !== 'production',
			},
			this.logger as any,
		);

		if (this.config.k8sEnabled) {
			this.registerK8sHealthCheck();
		}

		this.logger.info('Leaderboard Awarder Service initialized successfully');
	}

	/**
	 * Start the service
	 */
	async start(): Promise<void> {
		this.logger.info('Starting Leaderboard Awarder Service');

		// Check if we need to run an immediate scan for missing awards
		await this.checkAndRunStartupScan();

		// Schedule the main job to run at 12:05 AM EST daily
		this.scheduleLeaderboardScans();

		// Start health check job
		if (this.config.healthCheckIntervalMs > 0) {
			this.logger.info(
				`Starting health check job with interval ${this.config.healthCheckIntervalMs}ms`,
			);
			this.healthCheckInterval = setInterval(
				() => this.performHealthCheck(),
				this.config.healthCheckIntervalMs,
			);
		}

		this.logger.info('Leaderboard Awarder Service started successfully');
	}

	/**
	 * Stop the service
	 */
	async stop(): Promise<void> {
		if (this.isShuttingDown) {
			return;
		}

		this.isShuttingDown = true;
		this.logger.info('Stopping Leaderboard Awarder Service');

		if (this.checkInterval) {
			clearInterval(this.checkInterval);
			this.checkInterval = null;
		}

		if (this.healthCheckInterval) {
			clearInterval(this.healthCheckInterval);
			this.healthCheckInterval = null;
		}

		if (this.healthServer) {
			try {
				await this.healthServer.stop();
				this.logger.info('Stopped health check HTTP server');
			} catch (error) {
				this.logger.error('Error stopping health check server', { error });
			}
		}

		try {
			await this.redis.quit();
			await this.pg?.destroy();
			this.logger.info('Closed database and Redis connections');
		} catch (error) {
			this.logger.error('Error closing connections', { error });
		}

		this.logger.info('Leaderboard Awarder Service stopped successfully');
	}

	/**
	 * Check if awards have been distributed today and run immediate scan if not
	 */
	private async checkAndRunStartupScan(): Promise<void> {
		try {
			this.logger.info('Checking for missing awards on startup');

			const now = DateTime.now().setZone('America/New_York');
			const dayOfWeek = now.weekday;
			const dayOfMonth = now.day;
			const dayOfYear = now.ordinal;

			// Check if we should have awarded anything today
			const shouldCheckDaily = true;
			const shouldCheckWeekly = dayOfWeek === 1; // Monday
			const shouldCheckMonthly = dayOfMonth === 1; // First of month
			const shouldCheckYearly = dayOfYear === 1; // January 1st

			// Sample check: Look for any award key from today's expected awards
			// We'll check just one leaderboard to see if the job ran
			const leaderboards = await this.pg
				?.selectFrom('leaderboards')
				.select(['id'])
				.where('public', '=', true)
				.limit(1)
				.execute();

			if (!leaderboards || leaderboards.length === 0) {
				this.logger.info('No active leaderboards found for startup check');
				return;
			}

			const testLeaderboardId = leaderboards[0].id;
			let needsImmediateScan = false;

			// Check daily awards (should always exist for yesterday)
			if (shouldCheckDaily) {
				const yesterday = now.minus({ days: 1 });
				const dailyPattern = `award:${testLeaderboardId.toString()}:day:${yesterday.startOf('day').toISODate()}:*`;
				this.logger.info(
					`Checking for daily award keys with pattern: ${dailyPattern}`,
				);
				const dailyKeys = await this.redis.keys(dailyPattern);

				if (dailyKeys.length === 0) {
					this.logger.warn('Missing daily awards - will run immediate scan');
					needsImmediateScan = true;
				} else {
					this.logger.info(`Found ${dailyKeys.length} daily award keys`);
				}
			}

			// Check weekly awards if it's Monday
			if (shouldCheckWeekly && !needsImmediateScan) {
				const lastWeek = now.minus({ weeks: 1 });
				const weeklyPattern = `award:${testLeaderboardId.toString()}:week:${lastWeek.startOf('week').toISODate()}:*`;
				this.logger.info(
					`Checking for weekly award keys with pattern: ${weeklyPattern}`,
				);
				const weeklyKeys = await this.redis.keys(weeklyPattern);

				if (weeklyKeys.length === 0) {
					this.logger.warn(
						'Missing weekly awards on Monday - will run immediate scan',
					);
					needsImmediateScan = true;
				} else {
					this.logger.info(`Found ${weeklyKeys.length} weekly award keys`);
				}
			}

			// Check monthly awards if it's the 1st
			if (shouldCheckMonthly && !needsImmediateScan) {
				const lastMonth = now.minus({ months: 1 });
				const monthlyPattern = `award:${testLeaderboardId.toString()}:month:${lastMonth.startOf('month').toISODate()}:*`;
				this.logger.info(
					`Checking for monthly award keys with pattern: ${monthlyPattern}`,
				);
				const monthlyKeys = await this.redis.keys(monthlyPattern);

				if (monthlyKeys.length === 0) {
					this.logger.warn(
						'Missing monthly awards on 1st - will run immediate scan',
					);
					needsImmediateScan = true;
				} else {
					this.logger.info(`Found ${monthlyKeys.length} monthly award keys`);
				}
			}

			// Check yearly awards if it's January 1st
			if (shouldCheckYearly && !needsImmediateScan) {
				const lastYear = now.minus({ years: 1 });
				const yearlyPattern = `award:${testLeaderboardId.toString()}:year:${lastYear.startOf('year').toISODate()}:*`;
				this.logger.info(
					`Checking for yearly award keys with pattern: ${yearlyPattern}`,
				);
				const yearlyKeys = await this.redis.keys(yearlyPattern);

				if (yearlyKeys.length === 0) {
					this.logger.warn(
						'Missing yearly awards on January 1st - will run immediate scan',
					);
					needsImmediateScan = true;
				} else {
					this.logger.info(`Found ${yearlyKeys.length} yearly award keys`);
				}
			}

			if (needsImmediateScan) {
				this.logger.info(
					'Running immediate leaderboard scan due to missing awards',
				);
				await this.runLeaderboardScans();
			} else {
				this.logger.info('Awards are up to date, no immediate scan needed');
			}
		} catch (error) {
			this.logger.error('Error checking for missing awards on startup:', error);
			// Don't fail startup, just log the error
		}
	}

	/**
	 * Schedule leaderboard scans to run daily at 12:05 AM EST
	 */
	private scheduleLeaderboardScans(): void {
		// Calculate next 12:05 AM EST
		const now = DateTime.now().setZone('America/New_York');
		let next = now.set({ hour: 0, minute: 5, second: 0, millisecond: 0 });

		// If it's already past 12:05 AM today, schedule for tomorrow
		if (now > next) {
			next = next.plus({ days: 1 });
		}

		const msUntilNext = next.diff(now).milliseconds;

		this.logger.info(
			`Scheduling first leaderboard scan for ${next.toFormat('yyyy-MM-dd HH:mm:ss zzz')} (${msUntilNext}ms from now)`,
		);

		// Schedule the first run
		setTimeout(() => {
			this.runLeaderboardScans();
			// Then set up daily interval (24 hours)
			this.checkInterval = setInterval(
				() => {
					this.runLeaderboardScans();
				},
				24 * 60 * 60 * 1000,
			);
		}, msUntilNext);
	}

	/**
	 * Run the main leaderboard scanning and awarding job
	 */
	private async runLeaderboardScans(): Promise<void> {
		if (this.isShuttingDown) {
			return;
		}

		const lock = new RedisLock(
			`${this.config.serviceName}:scan`,
			4 * 60 * 60 * 1000, // 4 hour lock
		);

		try {
			const acquired = await lock.acquire();
			if (!acquired) {
				this.logger.debug(
					'Leaderboard scan skipped - another instance is running',
				);
				return;
			}

			this.logger.info('Starting leaderboard scan and awarding job');
			const startTime = Date.now();

			// Get all active leaderboards
			const leaderboards = await this.pg
				?.selectFrom('leaderboards')
				.select(['id', 'game', 'title'])
				.where('public', '=', true)
				.execute();

			if (!leaderboards || leaderboards.length === 0) {
				this.logger.info('No active leaderboards found');
				return;
			}

			this.logger.info(`Found ${leaderboards.length} leaderboards to process`);

			const results = {
				daily: 0,
				weekly: 0,
				monthly: 0,
				yearly: 0,
				errors: 0,
			};

			// Process each leaderboard for all time periods
			for (const leaderboard of leaderboards) {
				try {
					await this.processLeaderboardAwards(
						leaderboard.id,
						leaderboard.title || `Leaderboard ${leaderboard.id}`,
						results,
					);
				} catch (error) {
					this.logger.error(
						`Error processing leaderboard ${leaderboard.id}:`,
						error,
					);
					results.errors++;
				}
			}

			const duration = Date.now() - startTime;
			this.metrics.recordHistogram('leaderboard_awarder_duration_ms', duration);
			this.logger.info('Leaderboard scan and awarding job completed', {
				durationMs: duration,
				results,
			});
		} catch (error) {
			this.metrics.incrementCounter('leaderboard_awarder_failures');
			this.logger.error('Leaderboard scan and awarding job failed', { error });
		} finally {
			await lock.release();
		}
	}

	/**
	 * Process awards for a single leaderboard across all time periods
	 */
	private async processLeaderboardAwards(
		leaderboardId: bigint,
		leaderboardTitle: string,
		results: {
			daily: number;
			weekly: number;
			monthly: number;
			yearly: number;
			errors: number;
		},
	): Promise<void> {
		const now = DateTime.now().setZone('America/New_York');
		const dayOfWeek = now.weekday; // 1 = Monday, 7 = Sunday
		const dayOfMonth = now.day;
		const dayOfYear = now.ordinal;

		const periods = [
			{
				name: 'day',
				points: 250,
				frameSize: 'day' as const,
				displayName: 'daily',
				shouldAward: true, // Always award daily
			},
			{
				name: 'week',
				points: 1000,
				frameSize: 'week' as const,
				displayName: 'weekly',
				shouldAward: dayOfWeek === 1, // Award on Monday
			},
			{
				name: 'month',
				points: 2000,
				frameSize: 'month' as const,
				displayName: 'monthly',
				shouldAward: dayOfMonth === 1, // Award on first of month
			},
			{
				name: 'year',
				points: 10000,
				frameSize: 'year' as const,
				displayName: 'yearly',
				shouldAward: dayOfYear === 1, // Award on January 1st
			},
		];

		for (const period of periods) {
			if (!period.shouldAward) {
				this.logger.info(
					`Skipping ${period.name} awards for leaderboard ${leaderboardId} - not scheduled for today (day of week: ${dayOfWeek}, day of month: ${dayOfMonth}, day of year: ${dayOfYear})`,
				);
				continue;
			}

			this.logger.info(
				`Processing ${period.name} awards for leaderboard ${leaderboardId} (${leaderboardTitle})`,
			);

			try {
				const awarded = await this.awardTopScorer(
					leaderboardId,
					leaderboardTitle,
					period.frameSize,
					period.points,
					period.displayName,
				);
				if (awarded) {
					results[period.name as keyof typeof results]++;
					this.logger.info(
						`Successfully awarded ${period.name} leader for leaderboard ${leaderboardId}`,
					);
				} else {
					this.logger.info(
						`No award given for ${period.name} leader on leaderboard ${leaderboardId} (no winner or already awarded)`,
					);
				}
			} catch (error) {
				this.logger.error(
					`Error awarding ${period.name} leader for leaderboard ${leaderboardId}:`,
					error,
				);
				results.errors++;
			}
		}
	}

	/**
	 * Award points to the top scorer in a leaderboard for a given time period
	 */
	private async awardTopScorer(
		leaderboardId: bigint,
		leaderboardTitle: string,
		frameSize: 'day' | 'week' | 'month' | 'year',
		points: number,
		periodDisplayName: string,
	): Promise<boolean> {
		try {
			// Get the PREVIOUS time frame's top scorer (the period that just ended)
			const now = DateTime.now().setZone('America/New_York');
			// Go back to the previous period to get its winner
			const previousPeriod = now.minus({ [frameSize]: 1 });
			const framePoint = previousPeriod.toISO() ?? undefined;

			this.logger.debug(
				`Checking leaderboard ${leaderboardId} for ${frameSize} period ending ${previousPeriod.toISODate()}`,
			);

			const leaderboard = await ElasticLeaderboardService.getLeaderboard(
				leaderboardId,
				{
					limit: 1,
					orderDirection: 'desc',
					frameSize,
					framePoint,
				},
			);

			if (!leaderboard.scores || leaderboard.scores.length === 0) {
				this.logger.debug(
					`No scores found for leaderboard ${leaderboardId} ${frameSize} period ending ${previousPeriod.toISODate()}`,
				);
				return false;
			}

			const topScorer = leaderboard.scores[0];
			const userId = topScorer.user;

			// Check if we've already awarded for this period (use the previous period's start date as key)
			const periodKey = previousPeriod.startOf(frameSize).toISODate();
			const awardKey = `award:${leaderboardId.toString()}:${frameSize}:${periodKey}:${userId}`;

			this.logger.info(`Checking Redis for award key: ${awardKey}`);

			const alreadyAwarded = await this.redis.get(awardKey);

			if (alreadyAwarded) {
				this.logger.debug(
					`Already awarded ${frameSize} points for leaderboard ${leaderboardId} to user ${userId} (key: ${awardKey})`,
				);
				return false;
			}

			// Award the points using grantPointsToUser (handles level-ups and achievements)
			// await grantPointsToUser(points, userId, this.pg!);

			// Mark as awarded with expiry
			const expiry = this.getExpiryForPeriod(frameSize);

			this.logger.info(
				`Setting Redis key ${awardKey} with expiry ${expiry} seconds`,
			);

			await this.redis.setex(awardKey, expiry, '1');

			// Send notification about the leaderboard win
			try {
				await sendNotification({
					user: userId,
					title: '🏆 Leaderboard Champion!',
					subtitle: `${periodDisplayName} #1`,
					body: `You placed #1 in the the ${periodDisplayName} ${leaderboardTitle}!`,
					icon: '/trophy.png',
					href: `/leaderboards/${leaderboardId}`,
					points,
				});
				this.logger.info(`Sent leaderboard win notification to user ${userId}`);
			} catch (notificationError) {
				this.logger.error(
					`Failed to send leaderboard notification to user ${userId}:`,
					notificationError,
				);
				// Don't fail the whole operation if notification fails
			}

			this.logger.info(
				`Awarded ${points} points to user ${userId} for ${frameSize} #1 on leaderboard ${leaderboardId}`,
				{
					leaderboardId,
					userId,
					points,
					frameSize,
					score: topScorer.score,
					periodKey,
					awardKey,
				},
			);

			this.metrics.incrementCounter('leaderboard_awards_granted');

			return true;
		} catch (error) {
			this.logger.error(
				`Failed to award ${frameSize} points for leaderboard ${leaderboardId}:`,
				error,
			);
			throw error;
		}
	}

	/**
	 * Get appropriate cache expiry for each time period
	 */
	private getExpiryForPeriod(
		frameSize: 'day' | 'week' | 'month' | 'year',
	): number {
		switch (frameSize) {
			case 'day':
				return 25 * 60 * 60; // 25 hours
			case 'week':
				return 8 * 24 * 60 * 60; // 8 days
			case 'month':
				return 32 * 24 * 60 * 60; // 32 days
			case 'year':
				return 367 * 24 * 60 * 60; // 367 days
		}
	}

	/**
	 * Perform health check
	 */
	private async performHealthCheck(): Promise<void> {
		if (this.isShuttingDown) {
			return;
		}

		try {
			this.logger.debug('Performing health check');

			// Check Redis
			const redisStartTime = Date.now();
			await this.redis.ping();
			const redisLatency = Date.now() - redisStartTime;
			this.metrics.recordGauge('redis_ping_latency_ms', redisLatency);

			// Check Database
			const dbStartTime = Date.now();
			await this.pg?.selectFrom('users').limit(1).execute();
			const dbLatency = Date.now() - dbStartTime;
			this.metrics.recordGauge('db_ping_latency_ms', dbLatency);

			this.logger.debug('Health check completed', {
				redisLatencyMs: redisLatency,
				dbLatencyMs: dbLatency,
			});
		} catch (error) {
			this.metrics.incrementCounter('health_check_failures');
			this.logger.error('Health check failed', { error });
		}
	}

	/**
	 * Register Kubernetes health check endpoints
	 */
	private healthServer: { stop: () => Promise<void> } | null = null;

	private async registerK8sHealthCheck(): Promise<void> {
		try {
			const { startHealthCheckServer } = await import('./http-server');

			const httpPort = parseInt(
				process.env.PORT || process.env.HEALTH_CHECK_PORT || '3000',
				10,
			);
			this.healthServer = startHealthCheckServer(httpPort, this);

			this.logger.info(
				`Kubernetes health check server started on port ${httpPort}`,
			);
		} catch (error) {
			this.logger.error('Failed to start health check server', { error });
		}
	}
}
