const alpha = 10;
const beta = 1.4;
const blog = Math.log(beta);
export const getLevelFromPoints = (xp: number): number =>
  xp >= 1 ? Math.floor(Math.log(xp / alpha + 1) / blog) : 0;
export const getPointsForLevel = (level: number): number =>
  level >= 1 ? alpha * (Math.pow(beta, level) - 1) : 0;
