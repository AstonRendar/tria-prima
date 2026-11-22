import { endMatchTurn } from '@/application/EndMatchTurn';
import { MatchState } from '@/application/MatchState';
import { rotateMatchCube } from '@/application/RotateMatchCube';
import { startMatch } from '@/application/StartMatch';
import { Position } from '@/domain/Position';
import { StubRandom, StubWordRepository } from './testdoubles';

function buildState() {
  return startMatch(
    { random: new StubRandom([0.1, 0.3, 0.5, 0.7, 0.9]), wordRepository: new StubWordRepository('CAMINO') },
    { p1Name: 'Alice', p2Name: 'Bob', p1Word: 'CAMINO', p2Word: 'PUERTA' }
  );
}

function rotated(state: MatchState, positions: Position[]): MatchState {
  return positions.reduce((s, p) => rotateMatchCube(s, p, 'roll-forward'), state);
}

describe('endMatchTurn', () => {
  it('alternates the current player', () => {
    const state = rotated(buildState(), [0, 1]);
    expect(endMatchTurn(state).currentPlayerId).not.toBe(state.currentPlayerId);
  });

  it('increments the turn counter', () => {
    const state = rotated(buildState(), [2, 5]);
    expect(endMatchTurn(state).turn).toBe(state.turn + 1);
  });

  it('locks the moved cubes for the rival and clears the moves of the turn', () => {
    const next = endMatchTurn(rotated(buildState(), [1, 4]));
    expect(next.board.lockedThisTurn).toEqual([1, 4]);
    expect(next.board.touchedThisTurn).toEqual([]);
  });

  it('opens the declaration window for the next turn', () => {
    const state = rotated(buildState(), [0, 4]);
    expect(state.canDeclareThisTurn).toBe(false);
    expect(endMatchTurn(state).canDeclareThisTurn).toBe(true);
  });

  it('resets revealedThisTurn', () => {
    const state = { ...rotated(buildState(), [1, 2]), revealedThisTurn: true };
    expect(endMatchTurn(state).revealedThisTurn).toBe(false);
  });

  it('refuses to end the turn without exactly 2 distinct moved cubes', () => {
    const none = buildState();
    expect(endMatchTurn(none)).toBe(none);
    const one = rotated(buildState(), [3]);
    expect(endMatchTurn(one)).toBe(one);
  });

  it('is a no-op when the game is finished', () => {
    const state = { ...rotated(buildState(), [0, 1]), finished: true };
    expect(endMatchTurn(state)).toBe(state);
  });
});
