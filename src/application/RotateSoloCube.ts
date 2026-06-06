import { rotateCubeAt } from '@/domain/Board';
import { RotationKind } from '@/domain/Cube';
import { Position } from '@/domain/Position';
import { SoloPlayState } from './SoloPlayState';

export function rotateSoloCube(
  state: SoloPlayState,
  position: Position,
  kind: RotationKind
): SoloPlayState {
  if (state.finished) return state;
  return { ...state, board: rotateCubeAt(state.board, position, kind) };
}
