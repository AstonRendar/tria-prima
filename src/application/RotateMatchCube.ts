import { rotateCubeAt } from '@/domain/Board';
import { RotationKind } from '@/domain/Cube';
import { Position } from '@/domain/Position';
import { MatchState } from './MatchState';

export function rotateMatchCube(
  state: MatchState,
  position: Position,
  kind: RotationKind
): MatchState {
  if (state.finished) return state;
  return { ...state, board: rotateCubeAt(state.board, position, kind) };
}
