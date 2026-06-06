import { swapPositions } from '@/domain/Board';
import { Position } from '@/domain/Position';
import { MatchState } from './MatchState';

export type SwapMatchResult = { state: MatchState; applied: boolean };

export function swapMatchCubes(
  state: MatchState,
  a: Position,
  b: Position
): SwapMatchResult {
  if (state.finished) return { state, applied: false };
  const board = swapPositions(state.board, a, b);
  if (board === state.board) return { state, applied: false };
  return { state: { ...state, board }, applied: true };
}
