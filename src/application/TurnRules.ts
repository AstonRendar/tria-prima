import { advanceLocks, Board, isValidTurnTouch, lockTouchedCubes, swapPositions } from '@/domain/Board';
import { findMatchedLine, ObjectiveSlot } from '@/domain/Objective';
import { PlayerId } from '@/domain/Player';
import { Position } from '@/domain/Position';
import { addMarkerForObjective, SecretWord } from '@/domain/SecretWord';

// Reglas de turno compartidas por el duelo y el solitario. Operan sobre las
// piezas comunes (tablero, objetivos, palabra marcada); cada modo las envuelve
// en su propio estado.

export function swapOnBoard(
  board: Board,
  a: Position,
  b: Position
): { board: Board; applied: boolean } {
  const next = swapPositions(board, a, b);
  return { board: next, applied: next !== board };
}

// Devuelve el tablero listo para el turno siguiente, o null si el turno no
// tocó exactamente 2 dados distintos.
export function boardAfterTurn(
  board: Board,
  touched: ReadonlyArray<Position>
): Board | null {
  if (!isValidTurnTouch(touched)) return null;
  return advanceLocks(lockTouchedCubes(board, touched));
}

export type DeclarationOutcome = {
  objectives: ObjectiveSlot[];
  word: SecretWord;
  declared: number;
  released: number;
  revealedCardIndices: number[];
};

// Algoritmo de declaración común: libera los bloqueos propios rotos, declara
// los objetivos cumplidos (nuevos o mantenidos, que cuentan como declaración
// repetida) y aplica un marcador por declaración sobre la palabra objetivo.
// Los slots que `canTouch` excluya (los del rival en el duelo) no se tocan.
export function declareOnBoard(
  board: Board,
  slots: ReadonlyArray<ObjectiveSlot>,
  owner: PlayerId,
  targetWord: SecretWord,
  canTouch: (slot: ObjectiveSlot) => boolean
): DeclarationOutcome {
  let released = 0;
  const matched: ObjectiveSlot[] = [];
  const objectives = slots.map((slot) => {
    if (!canTouch(slot)) return slot;
    const isFulfilled = findMatchedLine(board, slot.objective) !== null;
    if (slot.blockedBy === owner && !isFulfilled) {
      released++;
      return { ...slot, blockedBy: null };
    }
    if (isFulfilled) {
      const next: ObjectiveSlot = { ...slot, blockedBy: owner };
      matched.push(next);
      return next;
    }
    return slot;
  });

  let word = targetWord;
  const revealedCardIndices: number[] = [];
  for (const m of matched) {
    const result = addMarkerForObjective(word, m.objective);
    if (result) {
      word = result.word;
      if (result.revealed) revealedCardIndices.push(result.cardIndex);
    }
  }

  return { objectives, word, declared: matched.length, released, revealedCardIndices };
}
