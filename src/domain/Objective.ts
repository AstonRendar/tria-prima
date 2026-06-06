import { Board } from './Board';
import { topFace } from './Cube';
import { ALL_COLORS, CubeColor } from './Color';
import { PlayerId } from './Player';
import { ALL_SYMBOLS, CubeSymbol } from './Symbol';
import { allLines, Position } from './Position';

export type ObjectiveKind = 'symbol' | 'color';

export type Objective =
  | { readonly id: string; readonly kind: 'symbol'; readonly value: CubeSymbol }
  | { readonly id: string; readonly kind: 'color'; readonly value: CubeColor };

// Cada slot pertenece a la pool compartida de 6 objetivos. `blockedBy` indica
// qué jugador lo tiene en su zona de bloqueo (o `null` si está disponible).
export type ObjectiveSlot = {
  readonly objective: Objective;
  readonly blockedBy: PlayerId | null;
};

export const ALL_OBJECTIVES: ReadonlyArray<Objective> = [
  ...ALL_SYMBOLS.map<Objective>((s) => ({ id: `sym:${s}`, kind: 'symbol', value: s })),
  ...ALL_COLORS.map<Objective>((c) => ({ id: `col:${c}`, kind: 'color', value: c })),
];

export function buildInitialObjectiveSlots(): ObjectiveSlot[] {
  return ALL_OBJECTIVES.map((o) => ({ objective: o, blockedBy: null }));
}

export function isAvailable(slot: ObjectiveSlot): boolean {
  return slot.blockedBy === null;
}

export function findMatchedLine(board: Board, objective: Objective): Position[] | null {
  for (const line of allLines()) {
    if (lineSatisfies(board, line, objective)) return line;
  }
  return null;
}

function lineSatisfies(board: Board, line: Position[], objective: Objective): boolean {
  const faces = line.map((p) => topFace(board.cubes[p]));
  if (objective.kind === 'symbol') {
    return faces.every((f) => f.symbol === objective.value);
  }
  return faces.every((f) => f.color === objective.value);
}

export function isSatisfied(board: Board, slot: ObjectiveSlot): boolean {
  return isAvailable(slot) && findMatchedLine(board, slot.objective) !== null;
}

export function findAllSatisfied(
  board: Board,
  slots: ReadonlyArray<ObjectiveSlot>
): ObjectiveSlot[] {
  return slots.filter((slot) => isSatisfied(board, slot));
}
