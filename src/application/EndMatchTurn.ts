import { Position } from '@/domain/Position';
import { otherPlayer } from '@/domain/Player';
import { MatchState } from './MatchState';
import { boardAfterTurn } from './TurnRules';

export function endMatchTurn(
  state: MatchState,
  touched: ReadonlyArray<Position>
): MatchState {
  if (state.finished) return state;
  const board = boardAfterTurn(state.board, touched);
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
