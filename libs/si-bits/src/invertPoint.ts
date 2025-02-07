import type { Point2D } from './Point2D';

export const invertPoint = ({ x, y }: Point2D) => ({ x: -x, y: -y });
