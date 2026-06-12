import { startMatch } from '@/application/StartMatch';
import { StubRandom, StubWordRepository } from './testdoubles';

const deps = () => ({
  random: new StubRandom([0.1, 0.2, 0.3, 0.4, 0.5]),
  wordRepository: new StubWordRepository('CAMINO'),
});

describe('startMatch', () => {
  it('creates a board, 6 objectives and a 6-letter word per player', () => {
    const state = startMatch(deps(), {
      p1Name: 'Alice',
      p2Name: 'Bob',
      p1Word: 'PUERTA',
      p2Word: 'CAMINO',
    });
    expect(state.board.cubes).toHaveLength(9);
    expect(state.objectives).toHaveLength(6);
    expect(state.players.p1.name).toBe('Alice');
    expect(state.players.p2.name).toBe('Bob');
    expect(state.players.p1.secretWord.cards.map((c) => c.letter).join('')).toBe('PUERTA');
    expect(state.players.p2.secretWord.cards.map((c) => c.letter).join('')).toBe('CAMINO');
  });

  it('starts at turn 0 with declaration disabled (first move only)', () => {
    const state = startMatch(deps(), {
      p1Name: 'A',
      p2Name: 'B',
      p1Word: 'CAMINO',
      p2Word: 'PUERTA',
    });
    expect(state.turn).toBe(0);
    expect(state.canDeclareThisTurn).toBe(false);
  });

  it('picks one of the players as initial apprentice', () => {
    const state = startMatch(deps(), {
      p1Name: 'A',
      p2Name: 'B',
      p1Word: 'CAMINO',
      p2Word: 'PUERTA',
    });
    expect(['p1', 'p2']).toContain(state.currentPlayerId);
    expect(state.firstPlayerId).toBe(state.currentPlayerId);
  });

  it('honors an explicit first player choice', () => {
    const base = { p1Name: 'A', p2Name: 'B', p1Word: 'CAMINO', p2Word: 'PUERTA' };
    expect(startMatch(deps(), { ...base, firstPlayer: 'p1' }).currentPlayerId).toBe('p1');
    expect(startMatch(deps(), { ...base, firstPlayer: 'p2' }).currentPlayerId).toBe('p2');
  });

  it('draws the first player when the choice is random', () => {
    const base = { p1Name: 'A', p2Name: 'B', p1Word: 'CAMINO', p2Word: 'PUERTA' };
    const depsWith = (value: number) => ({
      random: new StubRandom([value]),
      wordRepository: new StubWordRepository('CAMINO'),
    });
    expect(
      startMatch(depsWith(0), { ...base, firstPlayer: 'random' }).currentPlayerId
    ).toBe('p1');
    expect(
      startMatch(depsWith(0.9), { ...base, firstPlayer: 'random' }).currentPlayerId
    ).toBe('p2');
  });

  it('normalizes accents and case in the supplied words', () => {
    const state = startMatch(deps(), {
      p1Name: 'A',
      p2Name: 'B',
      p1Word: 'camíno',
      p2Word: 'PuErTa',
    });
    expect(state.players.p1.secretWord.cards.map((c) => c.letter).join('')).toBe('CAMINO');
    expect(state.players.p2.secretWord.cards.map((c) => c.letter).join('')).toBe('PUERTA');
  });

  it('throws when a player word is not exactly 6 letters after normalization', () => {
    expect(() =>
      startMatch(deps(), {
        p1Name: 'A',
        p2Name: 'B',
        p1Word: 'SHORT',
        p2Word: 'CAMINO',
      })
    ).toThrow();
  });
});
