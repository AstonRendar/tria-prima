import { SoloPlayState } from './SoloPlayState';
import { declareOnBoard } from './TurnRules';

export type DeclareSoloResult = {
  state: SoloPlayState;
  declared: number;
  released: number;
  revealedCardIndices: number[];
};

const SOLO_OWNER = 'p1' as const;

// Misma regla que en duelo, aplicada con el algoritmo común de TurnRules:
// los marcadores caen sobre la propia palabra y no hay slots de rival.
export function declareSoloObjectives(state: SoloPlayState): DeclareSoloResult {
  if (state.finished || !state.canDeclareThisTurn) {
    return { state, declared: 0, released: 0, revealedCardIndices: [] };
  }

  const outcome = declareOnBoard(
    state.board,
    state.objectives,
    SOLO_OWNER,
    state.secretWord,
    () => true
  );

  const nextState: SoloPlayState = {
    ...state,
    objectives: outcome.objectives,
    secretWord: outcome.word,
    canDeclareThisTurn: false,
    revealedThisTurn: state.revealedThisTurn || outcome.revealedCardIndices.length > 0,
  };

  return {
    state: nextState,
    declared: outcome.declared,
    released: outcome.released,
    revealedCardIndices: outcome.revealedCardIndices,
  };
}
