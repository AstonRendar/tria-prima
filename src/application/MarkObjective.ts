import { Objective } from '@/domain/Objective';
import { addMarkerForObjective, MARKERS_TO_REVEAL } from '@/domain/SecretWord';
import {
  decrementDeclared,
  incrementDeclared,
  TrackerState,
} from './TrackerState';

export type MarkResult = {
  state: TrackerState;
  applied: boolean;
  revealedCardIndex: number | null;
};

export function markObjective(state: TrackerState, objective: Objective): MarkResult {
  if (state.finished) return { state, applied: false, revealedCardIndex: null };
  const result = addMarkerForObjective(state.secretWord, objective);
  // Una carta ya revelada no admite más marcadores: no se cuenta la declaración.
  if (!result || result.word === state.secretWord) {
    return { state, applied: false, revealedCardIndex: null };
  }
  return {
    state: {
      ...state,
      secretWord: result.word,
      declaredCount: incrementDeclared(state.declaredCount, objective),
    },
    applied: true,
    revealedCardIndex: result.revealed ? result.cardIndex : null,
  };
}

// Compensa una marca registrada por error: decrementa el contador y quita el
// último marcador de la carta. Si esa marca reveló la letra, la vuelve a
// ocultar con el marcador que tenía antes.
export function unmarkObjective(state: TrackerState, objective: Objective): TrackerState {
  if (state.finished) return state;
  const card = state.secretWord.cards.find(
    (c) =>
      c.faceSign.kind === objective.kind &&
      c.faceSign.value === objective.value
  );
  if (!card) return state;
  if (!card.revealed && card.markers === 0) return state;
  const undone = card.revealed
    ? { ...card, revealed: false, markers: MARKERS_TO_REVEAL - 1 }
    : { ...card, markers: card.markers - 1 };
  const cards = state.secretWord.cards.map((c) => (c === card ? undone : c));
  return {
    ...state,
    secretWord: { cards },
    declaredCount: decrementDeclared(state.declaredCount, objective),
  };
}
