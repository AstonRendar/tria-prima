import { rotateSoloCube } from '@/application/RotateSoloCube';
import { startSoloPlay } from '@/application/StartSoloPlay';
import { topFace } from '@/domain/Cube';
import { StubRandom, StubWordRepository } from './testdoubles';

function buildState() {
  return startSoloPlay({
    random: new StubRandom([0]),
    wordRepository: new StubWordRepository('CAMINO'),
  });
}

describe('rotateSoloCube', () => {
  it('applies the rotation to the cube at the given position', () => {
    const state = buildState();
    const before = state.board.cubes[0].orientation;
    const next = rotateSoloCube(state, 0, 'roll-backward');
    expect(topFace(next.board.cubes[0])).toEqual(before.front);
  });

  it('leaves the other cubes untouched', () => {
    const state = buildState();
    const next = rotateSoloCube(state, 0, 'spin-ccw');
    for (let i = 1; i < 9; i++) {
      expect(next.board.cubes[i]).toBe(state.board.cubes[i]);
    }
  });

  it('ignores the rotation when the cube is locked this turn', () => {
    const state = buildState();
    const locked = { ...state, board: { ...state.board, lockedThisTurn: [0] } };
    expect(rotateSoloCube(locked, 0, 'roll-forward').board).toBe(locked.board);
  });

  it('is a no-op when the game is finished', () => {
    const state = { ...buildState(), finished: true };
    expect(rotateSoloCube(state, 0, 'roll-forward')).toBe(state);
  });
});
