import { processReactions } from './processReactions';
import { defaultLogger as logger } from '@lyku/logger';

// Single process with modular internal components
export function flushAll() {
	logger.info('Starting flush pipeline for reactions and points');
	return processReactions()
		.then((postIds) => processPostPoints(postIds))
		.then((userIds) => processUserAchievements(userIds))
		.then((userIds) => processUserPoints(userIds))
		.catch((error) => {
			logger.error('Error in flush pipeline', { error });
			throw error;
		});
}

async function processPostPoints(postIds: string[]): Promise<string[]> {
	// Skip empty batches
	if (postIds.length === 0) return [];

	logger.info(`Processing post points for posts`, { count: postIds.length });

	try {
		// TODO: Implement post point processing
		// This would process both viral and regular posts
		return []; // Return affected user IDs
	} catch (error) {
		logger.error('Error processing post points', {
			error,
			postCount: postIds.length,
		});
		return []; // Return empty array on error to continue pipeline
	}
}

async function processUserAchievements(userIds: string[]): Promise<string[]> {
	// Skip empty batches
	if (userIds.length === 0) return [];

	logger.info(`Processing achievements for users`, { count: userIds.length });

	try {
		// TODO: Implement user achievement processing
		return userIds;
	} catch (error) {
		logger.error('Error processing user achievements', {
			error,
			userCount: userIds.length,
		});
		return userIds; // Continue with pipeline even on error
	}
}

async function processUserPoints(userIds: string[]): Promise<void> {
	// Skip empty batches
	if (userIds.length === 0) return;

	logger.info(`Processing points for users`, { count: userIds.length });

	try {
		// TODO: Implement user points processing
		// This would account for points from both viral and regular post interactions
		return;
	} catch (error) {
		logger.error('Error processing user points', {
			error,
			userCount: userIds.length,
		});
		// Since this is the final step, we can just return
		return;
	}
}
