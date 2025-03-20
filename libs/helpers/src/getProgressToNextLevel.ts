import { getLevelFromPoints, getPointsForLevel } from './getLevelFromPoints';

export const getProgressToNextLevel = (points: bigint): number => {
	if (typeof points !== 'bigint')
		throw new Error(
			`You called getProgressToNextLevel with a ${typeof points} instead of a bigint`,
		);
	console.log('p', points);
	const currentLevel = getLevelFromPoints(points);
	console.log('currentLevel', currentLevel);
	const xpRequiredForCurrentLevel = getPointsForLevel(currentLevel);
	console.log('xpRequiredForCurrentLevel', xpRequiredForCurrentLevel);
	const pointsSinceLastLevel = points - xpRequiredForCurrentLevel;
	console.log('pointsSinceLastLevel', pointsSinceLastLevel);
	const pointsToNextLevel = getPointsForLevel(currentLevel + 1);
	console.log('pointsToNextLevel', pointsToNextLevel);
	const divided = (pointsSinceLastLevel * 100n) / pointsToNextLevel;
	console.log('divided', divided);
	return Number(divided);
};
