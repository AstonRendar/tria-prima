import { endMatchTurn } from '@/application/EndMatchTurn';
import { startMatch } from '@/application/StartMatch';
import { StubRandom, StubWordRepository } from './testdoubles';

function buildState() {
  return startMatch(
    { random: new StubRandom([0.1, 0.3, 0.5, 0.7, 0.9]), wordRepository: new StubWordRepository('CAMINO') },
    { p1Name: 'Alice', p2Name: 'Bob', p1Word: 'CAMINO', p2Word: 'PUERTA' }
  );
}

describe('endMatchTurn', () => {
  it('alternates the current player', () => {
    const state = buildState();
    const initial = state.currentPlayerId;
    const next = endMatchTurn(state, [0]);
    expect(next.currentPlayerId).not.toBe(initial);
  });

  it('increments the turn counter', () => {
    const state = buildState();
    expect(endMatchTurn(state, []).turn).toBe(state.turn + 1);
  });

  it('locks the touched cubes for the next turn', () => {
    const state = buildState();
    const next = endMatchTurn(state, [1, 4]);
    expect(next.board.lockedThisTurn).toEqual([1, 4]);
  });

  it('opens the declaration window for the next turn', () => {
    const state = buildState();
    expect(state.canDeclareThisTurn).toBe(false);
    expect(endMatchTurn(state, [0]).canDeclareThisTurn).toBe(true);
  });

  it('resets revealedThisTurn', () => {
    const state = { ...buildState(), revealedThisTurn: true };
    expect(endMatchTurn(state, []).revealedThisTurn).toBe(false);
  });

  it('is a no-op when the game is finished', () => {
    const state = { ...buildState(), finished: true };
    expect(endMatchTurn(state, [0])).toBe(state);
  });
});
