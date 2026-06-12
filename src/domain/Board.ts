import { applyRotation, Cube, RotationKind } from './Cube';
import { Position, sameRowOrColumn } from './Position';

export type Board = {
  readonly cubes: ReadonlyArray<Cube>;
  readonly lockedThisTurn: ReadonlyArray<Position>;
  readonly lockedNextTurn: ReadonlyArray<Position>;
};

// Regla del juego: cada turno toca exactamente 2 dados distintos
// (un intercambio o dos giros).
export const TOUCHES_PER_TURN = 2;

export function isValidTurnTouch(touched: ReadonlyArray<Position>): boolean {
  return new Set(touched).size === TOUCHES_PER_TURN;
}

export function isLocked(board: Board, position: Position): boolean {
  return board.lockedThisTurn.includes(position);
}

export function rotateCubeAt(board: Board, position: Position, kind: RotationKind): Board {
  if (isLocked(board, position)) return board;
  const cubes = board.cubes.map((c, i) => (i === position ? applyRotation(c, kind) : c));
  return { ...board, cubes };
}

export function swapPositions(board: Board, a: Position, b: Position): Board {
  if (!sameRowOrColumn(a, b)) return board;
  if (isLocked(board, a) || isLocked(board, b)) return board;
  const cubes = board.cubes.slice();
  const tmp = cubes[a];
  cubes[a] = cubes[b];
  cubes[b] = tmp;
  return { ...board, cubes };
}

export function lockTouchedCubes(board: Board, touched: ReadonlyArray<Position>): Board {
  return { ...board, lockedNextTurn: dedupe(touched) };
}

export function advanceLocks(board: Board): Board {
  return { ...board, lockedThisTurn: board.lockedNextTurn, lockedNextTurn: [] };
}

function dedupe(values: ReadonlyArray<Position>): Position[] {
  const out: Position[] = [];
  for (const v of values) if (!out.includes(v)) out.push(v);
  return out;
}
