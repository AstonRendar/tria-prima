import { rotateMatchCube } from '@/application/RotateMatchCube';
import { startMatch } from '@/application/StartMatch';
import { topFace } from '@/domain/Cube';
import { StubRandom, StubWordRepository } from './testdoubles';

function buildState() {
  return startMatch(
    { random: new StubRandom([0]), wordRepository: new StubWordRepository('CAMINO') },
    { p1Name: 'Alice', p2Name: 'Bob', p1Word: 'CAMINO', p2Word: 'PUERTA' }
  );
}

describe('rotateMatchCube', () => {
  it('applies the rotation to the cube at the given position', () => {
    const state = buildState();
    const before = state.board.cubes[0].orientation;
    const next = rotateMatchCube(state, 0, 'roll-forward');
    expect(topFace(next.board.cubes[0])).toEqual(before.back);
  });

  it('leaves the other cubes untouched', () => {
    const state = buildState();
    const next = rotateMatchCube(state, 0, 'spin-cw');
    for (let i = 1; i < 9; i++) {
      expect(next.board.cubes[i]).toBe(state.board.cubes[i]);
    }
  });

  it('ignores the rotation when the cube is locked this turn', () => {
    const state = buildState();
    const locked = { ...state, board: { ...state.board, lockedThisTurn: [0] } };
    expect(rotateMatchCube(locked, 0, 'roll-forward').board).toBe(locked.board);
  });

  it('is a no-op when the game is finished', () => {
    const state = { ...buildState(), finished: true };
    expect(rotateMatchCube(state, 0, 'roll-forward')).toBe(state);
  });
});
