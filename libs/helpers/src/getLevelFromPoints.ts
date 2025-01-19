import { levelThresholds } from './levelThresholds';

export const getLevelFromPoints = (points: bigint): number => {
	if (points < 0) {
		throw new Error('Points must be a non-negative number');
	}

	// Determine user level based on points
	for (let i = levelThresholds.length - 1; i >= 0; i--) {
		if (points >= levelThresholds[i].minPoints) {
			return levelThresholds[i].level;
		}
	}

	return 1; // Default to level 1 if no thresholds are met
};

export const getPointsForLevel = (level: number): bigint => {
	if (level < 1) {
		throw new Error('Level must be 1 or higher');
	}
	return levelThresholds[level - 1].minPoints; // Get minPoints for the specified level
};
