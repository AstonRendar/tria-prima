import { Objective } from '@/domain/Objective';
import { addMarkerForObjective } from '@/domain/SecretWord';
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
  if (!result) return { state, applied: false, revealedCardIndex: null };
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

// Compensa una marca registrada por error: decrementa el contador y, si el
// rival aún no había revelado la letra, quita el último marcador de la carta
// correspondiente. Si ya estaba revelada, no se puede deshacer.
export function unmarkObjective(state: TrackerState, objective: Objective): TrackerState {
  if (state.finished) return state;
  const card = state.secretWord.cards.find(
    (c) =>
      c.faceSign.kind === objective.kind &&
      c.faceSign.value === objective.value
  );
  if (!card) return state;
  if (card.revealed) return state;
  if (card.markers === 0) return state;
  const cards = state.secretWord.cards.map((c) =>
    c === card ? { ...c, markers: c.markers - 1 } : c
  );
  return {
    ...state,
    secretWord: { cards },
    declaredCount: decrementDeclared(state.declaredCount, objective),
  };
}
