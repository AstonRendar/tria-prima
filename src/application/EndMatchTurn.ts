import { closeTurn } from '@/domain/Board';
import { otherPlayer } from '@/domain/Player';
import { MatchState } from './MatchState';

export function endMatchTurn(state: MatchState): MatchState {
  if (state.finished) return state;
  const board = closeTurn(state.board);
  if (!board) return state;
  return {
    ...state,
    board,
    turn: state.turn + 1,
    currentPlayerId: otherPlayer(state.currentPlayerId),
    canDeclareThisTurn: true,
    revealedThisTurn: false,
  };
}
