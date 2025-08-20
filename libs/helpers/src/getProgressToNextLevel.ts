import { getLevelFromPoints, getPointsForLevel } from './getLevelFromPoints';

export const getProgressToNextLevel = (points: bigint): number => {
	if (typeof points !== 'bigint')
		throw new Error(
			`You called getProgressToNextLevel with a ${typeof points} instead of a bigint`,
		);
	const currentLevel = getLevelFromPoints(points);
	const xpRequiredForCurrentLevel = getPointsForLevel(currentLevel);
	const pointsSinceLastLevel = points - xpRequiredForCurrentLevel;
	const pointsToNextLevel =
		getPointsForLevel(currentLevel + 1) - xpRequiredForCurrentLevel;
	const divided = (pointsSinceLastLevel * 100n) / pointsToNextLevel;
	return Number(divided);
};
