import { startMatch } from '@/application/StartMatch';
import { swapMatchCubes } from '@/application/SwapMatchCubes';
import { StubRandom, StubWordRepository } from './testdoubles';

function buildState() {
  return startMatch(
    { random: new StubRandom([0]), wordRepository: new StubWordRepository('CAMINO') },
    { p1Name: 'Alice', p2Name: 'Bob', p1Word: 'CAMINO', p2Word: 'PUERTA' }
  );
}

describe('swapMatchCubes', () => {
  it('swaps two cubes of the same row', () => {
    const state = buildState();
    const result = swapMatchCubes(state, 0, 2);
    expect(result.applied).toBe(true);
    expect(result.state.board.cubes[0]).toBe(state.board.cubes[2]);
    expect(result.state.board.cubes[2]).toBe(state.board.cubes[0]);
  });

  it('swaps two cubes of the same column', () => {
    const state = buildState();
    const result = swapMatchCubes(state, 1, 7);
    expect(result.applied).toBe(true);
    expect(result.state.board.cubes[1]).toBe(state.board.cubes[7]);
  });

  it('rejects cubes that share neither row nor column', () => {
    const state = buildState();
    const result = swapMatchCubes(state, 0, 4);
    expect(result.applied).toBe(false);
    expect(result.state).toBe(state);
  });

  it('rejects swapping a cube with itself', () => {
    const state = buildState();
    expect(swapMatchCubes(state, 4, 4).applied).toBe(false);
  });

  it('rejects the swap when either cube is locked this turn', () => {
    const state = buildState();
    const locked = { ...state, board: { ...state.board, lockedThisTurn: [2] } };
    expect(swapMatchCubes(locked, 0, 2).applied).toBe(false);
  });

  it('is a no-op when the game is finished', () => {
    const state = { ...buildState(), finished: true };
    const result = swapMatchCubes(state, 0, 1);
    expect(result.applied).toBe(false);
    expect(result.state).toBe(state);
  });
});
