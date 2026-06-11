import { startTracker } from '@/application/StartTracker';
import { plainText } from '@/domain/SecretWord';
import { StubRandom, StubWordRepository } from './testdoubles';

function deps(word = 'CAMINO') {
  return { random: new StubRandom([0]), wordRepository: new StubWordRepository(word) };
}

describe('startTracker', () => {
  it('hides the word provided by the repository', () => {
    const state = startTracker(deps());
    expect(plainText(state.secretWord)).toBe('CAMINO');
    expect(state.secretWord.cards.every((c) => !c.revealed && c.markers === 0)).toBe(true);
  });

  it('assigns a distinct face sign to every card', () => {
    const state = startTracker(deps());
    const signs = state.secretWord.cards.map((c) => `${c.faceSign.kind}:${c.faceSign.value}`);
    expect(new Set(signs).size).toBe(6);
  });

  it('starts with no declarations and the game open', () => {
    const state = startTracker(deps());
    expect(state.declaredCount.size).toBe(0);
    expect(state.finished).toBe(false);
    expect(state.outcome).toBe(null);
  });

  it('rejects repository words that do not have 6 letters', () => {
    expect(() => startTracker(deps('SOL'))).toThrow();
  });
});
