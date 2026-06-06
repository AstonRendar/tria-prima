import { startSoloPlay } from '@/application/StartSoloPlay';
import { StubRandom, StubWordRepository } from './testdoubles';

describe('startSoloPlay', () => {
  it('creates a board, 6 objectives and a 6-letter secret word', () => {
    const state = startSoloPlay({
      random: new StubRandom([0.1, 0.2, 0.3, 0.4, 0.5]),
      wordRepository: new StubWordRepository('CAMINO'),
    });
    expect(state.board.cubes).toHaveLength(9);
    expect(state.objectives).toHaveLength(6);
    expect(state.secretWord.cards).toHaveLength(6);
    expect(state.secretWord.cards.map((c) => c.letter).join('')).toBe('CAMINO');
  });

  it('starts at turn 0 with declaration disabled (first move only)', () => {
    const state = startSoloPlay({
      random: new StubRandom([0]),
      wordRepository: new StubWordRepository('CAMINO'),
    });
    expect(state.turn).toBe(0);
    expect(state.canDeclareThisTurn).toBe(false);
    expect(state.finished).toBe(false);
  });

  it('counts initial free objectives present in the rolled board', () => {
    const state = startSoloPlay({
      random: new StubRandom([0]),
      wordRepository: new StubWordRepository('CAMINO'),
    });
    expect(state.initialFreeObjectives).toBeGreaterThanOrEqual(0);
  });

  it('throws when the repository returns a word of the wrong length', () => {
    expect(() =>
      startSoloPlay({
        random: new StubRandom([0]),
        wordRepository: new StubWordRepository('SHORT'),
      })
    ).toThrow();
  });
});
