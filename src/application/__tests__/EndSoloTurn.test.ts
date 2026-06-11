import { endSoloTurn } from '@/application/EndSoloTurn';
import { startSoloPlay } from '@/application/StartSoloPlay';
import { StubRandom, StubWordRepository } from './testdoubles';

function buildState() {
  return startSoloPlay({
    random: new StubRandom([0]),
    wordRepository: new StubWordRepository('CAMINO'),
  });
}

describe('endSoloTurn', () => {
  it('increments the turn counter', () => {
    const state = buildState();
    expect(endSoloTurn(state, []).turn).toBe(state.turn + 1);
  });

  it('locks the touched cubes for the next turn', () => {
    const next = endSoloTurn(buildState(), [1, 4]);
    expect(next.board.lockedThisTurn).toEqual([1, 4]);
    expect(next.board.lockedNextTurn).toEqual([]);
  });

  it('deduplicates touched positions before locking', () => {
    expect(endSoloTurn(buildState(), [3, 3]).board.lockedThisTurn).toEqual([3]);
  });

  it('releases the previous turn locks', () => {
    const first = endSoloTurn(buildState(), [0, 1]);
    const second = endSoloTurn(first, [7, 8]);
    expect(second.board.lockedThisTurn).toEqual([7, 8]);
  });

  it('opens the declaration window for the next turn', () => {
    const state = buildState();
    expect(state.canDeclareThisTurn).toBe(false);
    expect(endSoloTurn(state, [0]).canDeclareThisTurn).toBe(true);
  });

  it('resets revealedThisTurn', () => {
    const state = { ...buildState(), revealedThisTurn: true };
    expect(endSoloTurn(state, []).revealedThisTurn).toBe(false);
  });

  it('is a no-op when the game is finished', () => {
    const state = { ...buildState(), finished: true };
    expect(endSoloTurn(state, [0])).toBe(state);
  });
});
