import { advanceLocks, lockTouchedCubes } from '@/domain/Board';
import { Position } from '@/domain/Position';
import { SoloPlayState } from './SoloPlayState';

export function endSoloTurn(
  state: SoloPlayState,
  touched: ReadonlyArray<Position>
): SoloPlayState {
  if (state.finished) return state;
  const locked = lockTouchedCubes(state.board, touched);
  const advanced = advanceLocks(locked);
  return {
    ...state,
    board: advanced,
    turn: state.turn + 1,
    canDeclareThisTurn: true,
    revealedThisTurn: false,
  };
}
