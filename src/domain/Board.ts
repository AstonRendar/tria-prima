import { applyRotation, Cube, RotationKind } from './Cube';
import { Position, sameRowOrColumn } from './Position';

// `lockedThisTurn`: los dados que movió el rival en su turno (no se tocan).
// `touchedThisTurn`: los dados ya movidos en el turno en curso.
export type Board = {
  readonly cubes: ReadonlyArray<Cube>;
  readonly lockedThisTurn: ReadonlyArray<Position>;
  readonly touchedThisTurn: ReadonlyArray<Position>;
};

// Regla del juego: cada turno toca exactamente 2 dados distintos
// (un intercambio o dos giros).
export const TOUCHES_PER_TURN = 2;

export function isLocked(board: Board, position: Position): boolean {
  return board.lockedThisTurn.includes(position);
}

export function isTurnComplete(board: Board): boolean {
  return board.touchedThisTurn.length === TOUCHES_PER_TURN;
}

function canRotate(board: Board, position: Position): boolean {
  return (
    !isLocked(board, position) &&
    !board.touchedThisTurn.includes(position) &&
    board.touchedThisTurn.length < TOUCHES_PER_TURN
  );
}

export function rotateCubeAt(board: Board, position: Position, kind: RotationKind): Board {
  if (!canRotate(board, position)) return board;
  const cubes = board.cubes.map((c, i) => (i === position ? applyRotation(c, kind) : c));
  return { ...board, cubes, touchedThisTurn: [...board.touchedThisTurn, position] };
}

// El intercambio es la única acción del turno: solo con ningún dado movido.
export function swapPositions(board: Board, a: Position, b: Position): Board {
  if (a === b || !sameRowOrColumn(a, b)) return board;
  if (board.touchedThisTurn.length > 0) return board;
  if (isLocked(board, a) || isLocked(board, b)) return board;
  const cubes = board.cubes.slice();
  const tmp = cubes[a];
  cubes[a] = cubes[b];
  cubes[b] = tmp;
  return { ...board, cubes, touchedThisTurn: [a, b] };
}

// Cierra el turno: los dados movidos quedan bloqueados para el rival. Null si
// el turno no ha movido exactamente 2 dados distintos.
export function closeTurn(board: Board): Board | null {
  if (!isTurnComplete(board)) return null;
  return { ...board, lockedThisTurn: board.touchedThisTurn, touchedThisTurn: [] };
}
