import { Position } from '@/domain/Position';
import { MatchState } from './MatchState';
import { swapOnBoard } from './TurnRules';

export type SwapMatchResult = { state: MatchState; applied: boolean };

export function swapMatchCubes(
  state: MatchState,
  a: Position,
  b: Position
): SwapMatchResult {
  if (state.finished) return { state, applied: false };
  const { board, applied } = swapOnBoard(state.board, a, b);
  if (!applied) return { state, applied: false };
  return { state: { ...state, board }, applied: true };
}
