import { Position } from '@/domain/Position';
import { SoloPlayState } from './SoloPlayState';
import { swapOnBoard } from './TurnRules';

export type SwapSoloResult = { state: SoloPlayState; applied: boolean };

export function swapSoloCubes(
  state: SoloPlayState,
  a: Position,
  b: Position
): SwapSoloResult {
  if (state.finished) return { state, applied: false };
  const { board, applied } = swapOnBoard(state.board, a, b);
  if (!applied) return { state, applied: false };
  return { state: { ...state, board }, applied: true };
}
