import { closeTurn } from '@/domain/Board';
import { SoloPlayState } from './SoloPlayState';

export function endSoloTurn(state: SoloPlayState): SoloPlayState {
  if (state.finished) return state;
  const board = closeTurn(state.board);
  if (!board) return state;
  return {
    ...state,
    board,
    turn: state.turn + 1,
    canDeclareThisTurn: true,
    revealedThisTurn: false,
  };
}
