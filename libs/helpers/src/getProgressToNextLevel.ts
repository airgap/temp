import { getLevelFromPoints, getPointsForLevel } from './getLevelFromPoints';

export const getProgressToNextLevel = (points: bigint): number => {
	const currentLevel = getLevelFromPoints(points);
	const xpRequiredForCurrentLevel = getPointsForLevel(currentLevel);
	console.log('b', currentLevel, xpRequiredForCurrentLevel);
	console.log('b.5', typeof points, typeof xpRequiredForCurrentLevel);
	const pointsSinceLastLevel = points - xpRequiredForCurrentLevel;
	console.log('c', pointsSinceLastLevel);
	const pointsToNextLevel = getPointsForLevel(currentLevel + 1);
	console.log('d', pointsToNextLevel);
	return Number(pointsSinceLastLevel / pointsToNextLevel) * 100;
};
