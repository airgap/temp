import { createRedisClient } from '@lyku/redis-client';
import { Logger } from '@lyku/logger';
import { v4 as uuidv4 } from 'uuid';
import Redis from 'ioredis';

/**
 * Interface for jobs in the retry queue
 */
export interface RetryJob {
	id?: string;
	operation: string;
	params: Record<string, any>;
	attempts: number;
	maxAttempts: number;
	nextRetryAt?: number;
	createdAt?: number;
	updatedAt?: number;
}

/**
 * Interface for job processors
 */
export interface JobProcessor {
	process(job: RetryJob): Promise<boolean>;
}

/**
 * Options for the RetryQueue
 */
export interface RetryQueueOptions {
	/**
	 * Base delay between retries in milliseconds
	 * @default 15000 (15 seconds)
	 */
	baseRetryDelayMs?: number;

	/**
	 * Maximum delay between retries in milliseconds
	 * @default 3600000 (1 hour)
	 */
	maxRetryDelayMs?: number;

	/**
	 * Job expiration time in milliseconds
	 * @default 604800000 (7 days)
	 */
	jobExpirationMs?: number;

	/**
	 * Default maximum retry attempts
	 * @default 5
	 */
	defaultMaxAttempts?: number;

	/**
	 * How often to check for new jobs in milliseconds
	 * @default 5000 (5 seconds)
	 */
	pollIntervalMs?: number;

	/**
	 * How many jobs to process in a single batch
	 * @default 50
	 */
	batchSize?: number;

	/**
	 * Whether to start processing immediately
	 * @default true
	 */
	autoStart?: boolean;
}

/**
 * Implementation of a Redis-backed retry queue
 */
export class RetryQueue {
	private options: Required<RetryQueueOptions>;
	private processors: Map<string, JobProcessor> = new Map();
	private intervalId: NodeJS.Timeout | null = null;
	private processing = false;
	private queueKey: string;
	private processingQueueKey: string;
	private queueHashKey: string;

	/**
	 * Create a new RetryQueue
	 */
	constructor(
		private queueName: string,
		private redis: Redis,
		private logger: Logger,
		options: RetryQueueOptions = {},
	) {
		this.options = {
			baseRetryDelayMs: 15000,
			maxRetryDelayMs: 3600000,
			jobExpirationMs: 604800000,
			defaultMaxAttempts: 5,
			pollIntervalMs: 5000,
			batchSize: 50,
			autoStart: true,
			...options,
		};

		// Redis keys for this queue
		this.queueKey = `queue:${queueName}:jobs`;
		this.processingQueueKey = `queue:${queueName}:processing`;
		this.queueHashKey = `queue:${queueName}:job_data`;

		if (this.options.autoStart) {
			this.start();
		}
	}

	/**
	 * Register a processor for a specific operation
	 */
	registerProcessor(operation: string, processor: JobProcessor): void {
		this.processors.set(operation, processor);
		this.logger.info(`Registered processor for operation: ${operation}`, {
			queueName: this.queueName,
		});
	}

	/**
	 * Add a job to the retry queue
	 */
	async addToRetryQueue(
		job: Omit<RetryJob, 'id' | 'createdAt' | 'updatedAt' | 'nextRetryAt'>,
	): Promise<string> {
		const now = Date.now();
		const nextRetryAt = this.calculateNextRetryTime(job.attempts);

		const fullJob = {
			...job,
			id: uuidv4(),
			createdAt: now,
			updatedAt: now,
			nextRetryAt,
			maxAttempts: job.maxAttempts || this.options.defaultMaxAttempts,
		} satisfies RetryJob;

		const pipeline = this.redis.pipeline();

		// Store the job data
		pipeline.hset(this.queueHashKey, fullJob.id, JSON.stringify(fullJob));

		// Add the job to the sorted set with score as next retry time
		pipeline.zadd(this.queueKey, nextRetryAt.toString(), fullJob.id);

		// Set expiration on job data
		pipeline.expire(
			this.queueHashKey,
			Math.floor(this.options.jobExpirationMs / 1000),
		);
		pipeline.expire(
			this.queueKey,
			Math.floor(this.options.jobExpirationMs / 1000),
		);

		await pipeline.exec();

		this.logger.debug(`Added job to queue: ${fullJob.id}`, {
			queueName: this.queueName,
			operation: fullJob.operation,
		});

		return fullJob.id;
	}

	/**
	 * Start the queue processing
	 */
	start(): void {
		if (this.intervalId !== null) {
			return;
		}

		this.logger.info(`Starting queue: ${this.queueName}`);
		this.intervalId = setInterval(
			() => this.processJobs(),
			this.options.pollIntervalMs,
		);

		// Start immediate processing
		this.processJobs().catch((err) => {
			this.logger.error(`Error in initial queue processing`, {
				queueName: this.queueName,
				error: err,
			});
		});
	}

	/**
	 * Stop the queue processing
	 */
	stop(): void {
		if (this.intervalId === null) {
			return;
		}

		this.logger.info(`Stopping queue: ${this.queueName}`);
		clearInterval(this.intervalId);
		this.intervalId = null;
	}

	/**
	 * Process pending jobs
	 */
	private async processJobs(): Promise<void> {
		if (this.processing) {
			return;
		}

		try {
			this.processing = true;
			const now = Date.now();

			// Get jobs that are ready to be processed
			const jobIds = await this.redis.zrangebyscore(
				this.queueKey,
				'0',
				now.toString(),
				'LIMIT',
				0,
				this.options.batchSize,
			);

			if (jobIds.length === 0) {
				return;
			}

			this.logger.debug(`Found ${jobIds.length} jobs to process`, {
				queueName: this.queueName,
			});

			// Move jobs to processing queue
			const pipeline = this.redis.pipeline();

			for (const jobId of jobIds) {
				pipeline.zrem(this.queueKey, jobId);
				pipeline.zadd(
					this.processingQueueKey,
					(now + 300000).toString(),
					jobId,
				); // 5 minute timeout
			}

			await pipeline.exec();

			// Get job data
			const jobDataArray = await this.redis.hmget(this.queueHashKey, ...jobIds);

			// Process jobs
			for (let i = 0; i < jobIds.length; i++) {
				const jobId = jobIds[i];
				const jobData = jobDataArray[i];

				if (!jobData) {
					// Job data missing, remove from processing queue
					await this.redis.zrem(this.processingQueueKey, jobId);
					continue;
				}

				try {
					const job: RetryJob = JSON.parse(jobData);
					await this.processJob(job);
				} catch (error) {
					this.logger.error(`Error processing job ${jobId}`, {
						queueName: this.queueName,
						error,
					});

					// Move back to main queue for retry
					const nextRetryAt = this.calculateNextRetryTime(1);
					await this.redis.zrem(this.processingQueueKey, jobId);
					await this.redis.zadd(this.queueKey, nextRetryAt.toString(), jobId);
				}
			}
		} catch (error) {
			this.logger.error(`Error in queue processing`, {
				queueName: this.queueName,
				error,
			});
		} finally {
			this.processing = false;
		}
	}

	/**
	 * Process a single job
	 */
	private async processJob(job: RetryJob): Promise<void> {
		if (!job.id) throw new Error('No job id');
		const processor = this.processors.get(job.operation);

		if (!processor) {
			this.logger.warn(`No processor found for operation: ${job.operation}`, {
				queueName: this.queueName,
				jobId: job.id,
			});

			// Remove from queues
			await this.redis.zrem(this.processingQueueKey, job.id);
			await this.redis.hdel(this.queueHashKey, job.id);
			return;
		}

		try {
			const success = await processor.process(job);

			if (success) {
				// Job succeeded, remove from queues
				await this.redis.zrem(this.processingQueueKey, job.id);
				await this.redis.hdel(this.queueHashKey, job.id);

				this.logger.info(`Successfully processed job ${job.id}`, {
					queueName: this.queueName,
					operation: job.operation,
				});
			} else {
				// Job failed, increment attempts and reschedule
				job.attempts += 1;
				job.updatedAt = Date.now();

				if (job.attempts >= job.maxAttempts) {
					// Max attempts reached, remove from queues
					await this.redis.zrem(this.processingQueueKey, job.id);
					await this.redis.hdel(this.queueHashKey, job.id);

					this.logger.warn(
						`Job ${job.id} failed after ${job.attempts} attempts`,
						{
							queueName: this.queueName,
							operation: job.operation,
						},
					);
				} else {
					// Reschedule
					job.nextRetryAt = this.calculateNextRetryTime(job.attempts);

					const pipeline = this.redis.pipeline();
					pipeline.zrem(this.processingQueueKey, job.id);
					pipeline.zadd(this.queueKey, job.nextRetryAt.toString(), job.id);
					pipeline.hset(this.queueHashKey, job.id, JSON.stringify(job));
					await pipeline.exec();

					this.logger.info(
						`Rescheduled job ${job.id} after ${job.attempts} attempts`,
						{
							queueName: this.queueName,
							operation: job.operation,
							nextRetryAt: new Date(job.nextRetryAt).toISOString(),
						},
					);
				}
			}
		} catch (error) {
			this.logger.error(`Error processing job ${job.id}`, {
				queueName: this.queueName,
				operation: job.operation,
				error,
			});

			// Reschedule with incremented attempts
			job.attempts += 1;
			job.updatedAt = Date.now();

			if (job.attempts >= job.maxAttempts) {
				// Max attempts reached, remove from queues
				await this.redis.zrem(this.processingQueueKey, job.id);
				await this.redis.hdel(this.queueHashKey, job.id);
			} else {
				// Reschedule
				job.nextRetryAt = this.calculateNextRetryTime(job.attempts);

				const pipeline = this.redis.pipeline();
				pipeline.zrem(this.processingQueueKey, job.id);
				pipeline.zadd(this.queueKey, job.nextRetryAt.toString(), job.id);
				pipeline.hset(this.queueHashKey, job.id, JSON.stringify(job));
				await pipeline.exec();
			}
		}
	}

	/**
	 * Calculate the next retry time with exponential backoff
	 */
	private calculateNextRetryTime(attempts: number): number {
		// Exponential backoff with jitter
		const baseDelay = this.options.baseRetryDelayMs;
		const maxDelay = this.options.maxRetryDelayMs;

		// Calculate delay with exponential backoff: baseDelay * 2^attempts
		let delay = baseDelay * Math.pow(2, attempts);

		// Add jitter (±20%)
		const jitter = delay * 0.2 * (Math.random() * 2 - 1);
		delay += jitter;

		// Cap at maximum delay
		delay = Math.min(delay, maxDelay);

		return Date.now() + delay;
	}
}

/**
 * Helper function to add a job to a retry queue
 */
export async function addToRetryQueue(
	queueName: string,
	job: Omit<RetryJob, 'id' | 'createdAt' | 'updatedAt' | 'nextRetryAt'>,
): Promise<string> {
	// This would typically access a singleton/global instance of the queue system
	// In a real implementation, this would be injected or accessed through a service locator
	const queueSystem = (global as any).__queueSystem as Record<
		string,
		RetryQueue
	>;

	if (!queueSystem || !queueSystem[queueName]) {
		throw new Error(`Queue ${queueName} not found in the queue system`);
	}

	return queueSystem[queueName].addToRetryQueue(job);
}

/**
 * Initialize the queue system
 */
export function initializeQueueSystem(
	redis: Redis,
	logger: Logger,
	options: { [queueName: string]: RetryQueueOptions } = {},
): Record<string, RetryQueue> {
	const queueSystem: Record<string, RetryQueue> = {};

	// Create known queues
	const knownQueues = [
		'redis:persistence:retry',
		'notification:retry',
		'points:retry',
	];

	for (const queueName of knownQueues) {
		queueSystem[queueName] = new RetryQueue(
			queueName,
			redis,
			logger,
			options[queueName] || {},
		);
	}

	// Store in global for easier access
	(global as any).__queueSystem = queueSystem;

	return queueSystem;
}
