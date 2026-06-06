import { findMatchedLine, ObjectiveSlot } from '@/domain/Objective';
import { addMarkerForObjective, SecretWord } from '@/domain/SecretWord';
import { SoloPlayState } from './SoloPlayState';

export type DeclareSoloResult = {
  state: SoloPlayState;
  declared: number;
  released: number;
  revealedCardIndices: number[];
};

const SOLO_OWNER = 'p1' as const;

// Misma regla que en duelo: los objetivos cumplidos en el tablero (sean nuevos
// o mantenidos) cuentan como declaración y aplican marcador a la propia
// palabra. Mantener uno varios turnos suma marcadores repetidos.
export function declareSoloObjectives(state: SoloPlayState): DeclareSoloResult {
  if (state.finished) {
    return { state, declared: 0, released: 0, revealedCardIndices: [] };
  }
  if (!state.canDeclareThisTurn) {
    return { state, declared: 0, released: 0, revealedCardIndices: [] };
  }

  let released = 0;
  const matched: ObjectiveSlot[] = [];
  const objectives: ObjectiveSlot[] = state.objectives.map((slot) => {
    const isFulfilled = findMatchedLine(state.board, slot.objective) !== null;
    if (slot.blockedBy === SOLO_OWNER && !isFulfilled) {
      released++;
      return { ...slot, blockedBy: null };
    }
    if (isFulfilled) {
      const next: ObjectiveSlot = { ...slot, blockedBy: SOLO_OWNER };
      matched.push(next);
      return next;
    }
    return slot;
  });

  let word: SecretWord = state.secretWord;
  const revealed: number[] = [];
  for (const m of matched) {
    const result = addMarkerForObjective(word, m.objective);
    if (result) {
      word = result.word;
      if (result.revealed) revealed.push(result.cardIndex);
    }
  }

  const nextState: SoloPlayState = {
    ...state,
    objectives,
    secretWord: word,
    canDeclareThisTurn: false,
    revealedThisTurn: state.revealedThisTurn || revealed.length > 0,
  };

  return {
    state: nextState,
    declared: matched.length,
    released,
    revealedCardIndices: revealed,
  };
}
