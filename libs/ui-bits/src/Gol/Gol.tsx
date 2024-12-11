import classnames from 'classnames';
import { ReactNode, useEffect, useState } from 'react';

import styles from './Gol.module.scss';

const rows = 9,
  cols = 16;
const freshBoard = (): Grid<boolean> =>
  new Array(rows).fill(false).map(() => new Array(cols).fill(false));

export const randomBoard = (): Grid<boolean> =>
  new Array(rows)
    .fill(false)
    .map(() => new Array(cols).fill(false).map(() => Math.random() > 0.8));
const Piece = ({ alive }: { alive: boolean }) => (
  <div className={classnames(styles.piece, { [styles.alive]: alive })} />
);

// const boards = [randomBoard()];
// const boards = [freshBoard()];
export const dumpBoard = (board: Grid<boolean | number>) =>
  board.map((row) => row.map((cell) => (cell ? '1' : '0')).join('')).join('\n');
// console.log(dumpBoard(boards[0]))
type Grid<T> = T[][];
type Point2d = { x: number; y: number };
const dropGrid = (
  rows: Grid<number | boolean>,
  { x, y }: Point2d,
  board: Grid<number | boolean>,
) => {
  for (let dy = 0; dy < rows.length; dy++) {
    for (let dx = 0; dx < rows[dy].length; dx++) {
      board[y + dy][x + dx] = rows[dy][dx];
    }
  }
};

const glider = [
  [1, 0, 1],
  [0, 1, 1],
  [0, 1, 0],
];
const mod = (x: number, m: number) => ((x % m) + m) % m;

export const Gol = () => {
  // const [g, setG] = useState(0);
  const [board, setBoard] = useState(freshBoard());
  useEffect(() => {
    dropGrid(glider, { x: 0, y: 0 }, board);
  }, [board]);
  useEffect(() => {
    const nextBoard: boolean[][] = board.map((row) => [...row]);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        let alive = board[y][x];
        let sum = alive ? -1 : 0;
        for (let dy = -1; dy < 2; dy++) {
          for (let dx = -1; dx < 2; dx++)
            if (board[mod(y + dy, rows)][mod(x + dx, cols)]) sum++;
        }
        if (sum < 2 || sum > 3) alive = false;
        else if (sum === 3) alive = true;
        nextBoard[y][x] = alive;
      }
    }
    setTimeout(() => setBoard(nextBoard), 100);
  }, [board]);
  const pieces: ReactNode[] = [];
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < cols; x++) pieces.push(<Piece alive={board[y][x]} />);

  // console.log(pieces);
  return <div className={styles.Gol}>{pieces}</div>;
};
