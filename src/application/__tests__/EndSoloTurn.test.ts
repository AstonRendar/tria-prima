import { endSoloTurn } from '@/application/EndSoloTurn';
import { rotateSoloCube } from '@/application/RotateSoloCube';
import { SoloPlayState } from '@/application/SoloPlayState';
import { startSoloPlay } from '@/application/StartSoloPlay';
import { Position } from '@/domain/Position';
import { StubRandom, StubWordRepository } from './testdoubles';

function buildState() {
  return startSoloPlay({
    random: new StubRandom([0]),
    wordRepository: new StubWordRepository('CAMINO'),
  });
}

function rotated(state: SoloPlayState, positions: Position[]): SoloPlayState {
  return positions.reduce((s, p) => rotateSoloCube(s, p, 'roll-forward'), state);
}

describe('endSoloTurn', () => {
  it('increments the turn counter', () => {
    const state = rotated(buildState(), [2, 5]);
    expect(endSoloTurn(state).turn).toBe(state.turn + 1);
  });

  it('locks the moved cubes for the next turn', () => {
    const next = endSoloTurn(rotated(buildState(), [1, 4]));
    expect(next.board.lockedThisTurn).toEqual([1, 4]);
    expect(next.board.touchedThisTurn).toEqual([]);
  });

  it('releases the previous turn locks', () => {
    const first = endSoloTurn(rotated(buildState(), [0, 1]));
    const second = endSoloTurn(rotated(first, [7, 8]));
    expect(second.board.lockedThisTurn).toEqual([7, 8]);
  });

  it('opens the declaration window for the next turn', () => {
    const state = rotated(buildState(), [0, 4]);
    expect(state.canDeclareThisTurn).toBe(false);
    expect(endSoloTurn(state).canDeclareThisTurn).toBe(true);
  });

  it('resets revealedThisTurn', () => {
    const state = { ...rotated(buildState(), [1, 2]), revealedThisTurn: true };
    expect(endSoloTurn(state).revealedThisTurn).toBe(false);
  });

  it('refuses to end the turn without exactly 2 distinct moved cubes', () => {
    const none = buildState();
    expect(endSoloTurn(none)).toBe(none);
    const one = rotated(buildState(), [3]);
    expect(endSoloTurn(one)).toBe(one);
  });

  it('is a no-op when the game is finished', () => {
    const state = { ...rotated(buildState(), [0, 1]), finished: true };
    expect(endSoloTurn(state)).toBe(state);
  });
});
