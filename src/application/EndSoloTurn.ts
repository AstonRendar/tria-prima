import { Position } from '@/domain/Position';
import { SoloPlayState } from './SoloPlayState';
import { boardAfterTurn } from './TurnRules';

export function endSoloTurn(
  state: SoloPlayState,
  touched: ReadonlyArray<Position>
): SoloPlayState {
  if (state.finished) return state;
  const board = boardAfterTurn(state.board, touched);
  if (!board) return state;
  return {
    ...state,
    board,
    turn: state.turn + 1,
    canDeclareThisTurn: true,
    revealedThisTurn: false,
  };
}
