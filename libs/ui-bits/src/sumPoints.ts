import { Point2D } from './Point2D';

export const sumPoints = (...points: Point2D[]) =>
  points.reduce((acc, cur) => ({ x: acc.x + cur.x, y: acc.y + cur.y }));
