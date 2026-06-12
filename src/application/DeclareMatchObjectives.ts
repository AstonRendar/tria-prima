import { otherPlayer } from '@/domain/Player';
import { MatchState } from './MatchState';
import { declareOnBoard } from './TurnRules';

export type DeclareMatchResult = {
  state: MatchState;
  declared: number;
  released: number;
  revealedCardIndices: number[];
};

// Al cerrar la fase de declaración del jugador en turno se aplica el algoritmo
// común de TurnRules sobre la palabra del rival; los slots bloqueados por el
// rival quedan fuera del alcance.
export function declareMatchObjectives(state: MatchState): DeclareMatchResult {
  if (state.finished || !state.canDeclareThisTurn) {
    return { state, declared: 0, released: 0, revealedCardIndices: [] };
  }

  const me = state.currentPlayerId;
  const opponentId = otherPlayer(me);
  const outcome = declareOnBoard(
    state.board,
    state.objectives,
    me,
    state.players[opponentId].secretWord,
    (slot) => slot.blockedBy === null || slot.blockedBy === me
  );

  const nextState: MatchState = {
    ...state,
    objectives: outcome.objectives,
    players: {
      ...state.players,
      [opponentId]: {
        ...state.players[opponentId],
        secretWord: outcome.word,
      },
    },
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
