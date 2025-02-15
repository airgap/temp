<script lang="ts">
  import classnames from 'classnames';
  import styles from './Gol.module.scss';

  const rows = 9;
  const cols = 16;

  type Grid<T> = T[][];
  type Point2d = { x: number; y: number };

  const freshBoard = (): Grid<boolean> =>
    new Array(rows).fill(false).map(() => new Array(cols).fill(false));

  export const randomBoard = (): Grid<boolean> =>
    new Array(rows)
      .fill(false)
      .map(() => new Array(cols).fill(false).map(() => Math.random() > 0.8));

  const glider = [
    [1, 0, 1],
    [0, 1, 1],
    [0, 1, 0],
  ];

  const mod = (x: number, m: number) => ((x % m) + m) % m;

  const dropGrid = (
    rows: Grid<number | boolean>,
    { x, y }: Point2d,
    board: Grid<number | boolean>
  ) => {
    for (let dy = 0; dy < rows.length; dy++) {
      for (let dx = 0; dx < rows[dy].length; dx++) {
        board[y + dy][x + dx] = rows[dy][dx];
      }
    }
  };

  let board = freshBoard();
  dropGrid(glider, { x: 0, y: 0 }, board);

  function updateBoard() {
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
    board = nextBoard;
  }

  // Replace useEffect with onMount
  import { onMount } from 'svelte';
  onMount(() => {
    const interval = setInterval(updateBoard, 100);
    return () => clearInterval(interval);
  });
</script>

<div class={styles.Gol}>
  {#each Array(rows) as _, y}
    {#each Array(cols) as _, x}
      <div class={classnames(styles.piece, { [styles.alive]: board[y][x] })} ></div>
    {/each}
  {/each}
</div> 