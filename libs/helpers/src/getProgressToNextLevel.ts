import { getLevelFromPoints, getPointsForLevel } from './getLevelFromPoints';

export const getProgressToNextLevel = (points: bigint): number => {
	const currentLevel = getLevelFromPoints(points);
	const xpRequiredForCurrentLevel = getPointsForLevel(currentLevel);
	const pointsSinceLastLevel = points - xpRequiredForCurrentLevel;
	const pointsToNextLevel = getPointsForLevel(currentLevel + 1);
	return Number(pointsSinceLastLevel / pointsToNextLevel) * 100;
};
