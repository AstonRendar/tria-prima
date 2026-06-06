export const GRID_SIZE = 3;
export const BOARD_CELLS = GRID_SIZE * GRID_SIZE;

export type Position = number;

export function rowOf(position: Position): number {
  return Math.floor(position / GRID_SIZE);
}

export function colOf(position: Position): number {
  return position % GRID_SIZE;
}

export function sameRowOrColumn(a: Position, b: Position): boolean {
  if (a === b) return false;
  return rowOf(a) === rowOf(b) || colOf(a) === colOf(b);
}

export function rowPositions(row: number): Position[] {
  const start = row * GRID_SIZE;
  return [start, start + 1, start + 2];
}

export function colPositions(col: number): Position[] {
  return [col, col + GRID_SIZE, col + 2 * GRID_SIZE];
}

export function allLines(): Position[][] {
  const lines: Position[][] = [];
  for (let r = 0; r < GRID_SIZE; r++) lines.push(rowPositions(r));
  for (let c = 0; c < GRID_SIZE; c++) lines.push(colPositions(c));
  return lines;
}
