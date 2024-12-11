// export const getPointsToNextLevel = (n: number): number => Math.floor((Math.sqrt(1 + 8 * n) - 1) / 2);
import { getPointsForLevel } from './getLevelFromPoints';

export const getPointsToNextLevel = (points: number, currentLevel: number) =>
  getPointsForLevel(currentLevel + 1) - points;
