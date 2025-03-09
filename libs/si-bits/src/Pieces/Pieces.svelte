<script lang="ts">
  import { onMount } from 'svelte';
  import O from '../assets/o.png';
  import X from '../assets/x.png';
  import type { TtfMatch } from '@lyku/json-models';
  import Piece from './Piece.svelte';

  const images = { O, X };
  type Piece = {
    x: number;
    y: number;
    p: 'X' | 'O';
    i: number;
    key: number;
  };

  const { match } = $props<{ match: TtfMatch }>();
  
  let lastTurn = $state<number>();
  let lastBoard = $state<string>();
  let pieces = $state<Piece[]>([]);
  
  $effect(() => {
    if (lastTurn) {
      if (match.turn !== lastTurn && lastBoard) {
        console.log('blah blah');
        const pcs = match.turn < lastTurn ? [] : [...pieces];
        if (match.turn % 3 === 1) {
          for (let i = 0; i < 6; i++) {
            if (match.board[3 + i] !== lastBoard[i]) {
              const piece = {
                x: i % 3,
                y: Math.floor(i / 3),
                p: match.board[3 + i] as 'X' | 'O',
                i,
                key: match.turn * 81 + i,
              };
              const index = pcs.findIndex(({ i }) => i > piece.i) - 1;
              pcs.splice(index < 0 ? 0 : index, 0, piece);
            }
          }
          pieces = pcs;
          setTimeout(() => {
            pieces = pieces
              .map(({ x, y, p, i, key }) => ({
                x,
                p,
                y: y + 1,
                i: i + 3,
                key,
              }))
              .filter(({ i }) => i < 12);
          }, 500);
        } else {
          for (let i = 0; i < 9; i++) {
            if (match.board[i] !== lastBoard[i]) {
              const piece = {
                x: i % 3,
                y: Math.floor(i / 3),
                p: match.board[i] as 'X' | 'O',
                i,
                key: match.turn * 81 + i,
              };
              const index = pcs.findIndex(({ i }) => i > piece.i) - 1;
              pcs.splice(index < 0 ? 0 : index, 0, piece);
            }
          }
          pieces = pcs;
        }
      }
    } else if (!(lastBoard || lastTurn)) {
      pieces = match.board
        .split('')
        .map(
          (p, i) =>
            p !== '-' &&
            ({
              x: i % 3,
              y: ~~(i / 3),
              p,
              i,
              key: match.turn * 81 + i,
            } as Piece)
        )
        .filter((p) => p) as Piece[];
    }
    lastBoard = match.board;
    lastTurn = match.turn;
  });
</script>

<div class="board-pieces">
  {#each pieces as { x, y, p, i, key }}
    <Piece {x} {y} {p} {i} {key} />
  {/each}
</div>

<style>
  .board-pieces {
    position: relative;
    width: 100%;
    height: 100%;
  }
</style> 