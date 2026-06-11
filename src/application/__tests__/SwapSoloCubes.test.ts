import { startSoloPlay } from '@/application/StartSoloPlay';
import { swapSoloCubes } from '@/application/SwapSoloCubes';
import { StubRandom, StubWordRepository } from './testdoubles';

function buildState() {
  return startSoloPlay({
    random: new StubRandom([0]),
    wordRepository: new StubWordRepository('CAMINO'),
  });
}

describe('swapSoloCubes', () => {
  it('swaps two cubes of the same row', () => {
    const state = buildState();
    const result = swapSoloCubes(state, 3, 5);
    expect(result.applied).toBe(true);
    expect(result.state.board.cubes[3]).toBe(state.board.cubes[5]);
    expect(result.state.board.cubes[5]).toBe(state.board.cubes[3]);
  });

  it('swaps two cubes of the same column', () => {
    const state = buildState();
    const result = swapSoloCubes(state, 0, 6);
    expect(result.applied).toBe(true);
    expect(result.state.board.cubes[0]).toBe(state.board.cubes[6]);
  });

  it('rejects cubes that share neither row nor column', () => {
    const state = buildState();
    const result = swapSoloCubes(state, 2, 3);
    expect(result.applied).toBe(false);
    expect(result.state).toBe(state);
  });

  it('rejects swapping a cube with itself', () => {
    const state = buildState();
    expect(swapSoloCubes(state, 4, 4).applied).toBe(false);
  });

  it('rejects the swap when either cube is locked this turn', () => {
    const state = buildState();
    const locked = { ...state, board: { ...state.board, lockedThisTurn: [6] } };
    expect(swapSoloCubes(locked, 0, 6).applied).toBe(false);
  });

  it('is a no-op when the game is finished', () => {
    const state = { ...buildState(), finished: true };
    const result = swapSoloCubes(state, 0, 1);
    expect(result.applied).toBe(false);
    expect(result.state).toBe(state);
  });
});
