import { advanceLocks, isValidTurnTouch, lockTouchedCubes } from '@/domain/Board';
import { Position } from '@/domain/Position';
import { otherPlayer } from '@/domain/Player';
import { MatchState } from './MatchState';

export function endMatchTurn(
  state: MatchState,
  touched: ReadonlyArray<Position>
): MatchState {
  if (state.finished) return state;
  if (!isValidTurnTouch(touched)) return state;
  const locked = lockTouchedCubes(state.board, touched);
  const advanced = advanceLocks(locked);
  return {
    ...state,
    board: advanced,
    turn: state.turn + 1,
    currentPlayerId: otherPlayer(state.currentPlayerId),
    canDeclareThisTurn: true,
    revealedThisTurn: false,
  };
}
