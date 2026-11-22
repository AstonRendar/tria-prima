import { markObjective, unmarkObjective } from '@/application/MarkObjective';
import { startTracker } from '@/application/StartTracker';
import { ALL_OBJECTIVES } from '@/domain/Objective';
import { StubRandom, StubWordRepository } from './testdoubles';

function buildState() {
  return startTracker({
    random: new StubRandom([0]),
    wordRepository: new StubWordRepository('CAMINO'),
  });
}

// Con StubRandom el shuffle es la identidad: la carta i lleva el signo ALL_OBJECTIVES[i].
const FIRST = ALL_OBJECTIVES[0];

describe('markObjective', () => {
  it('adds a marker to the matching card and counts the declaration', () => {
    const result = markObjective(buildState(), FIRST);
    expect(result.applied).toBe(true);
    expect(result.revealedCardIndex).toBe(null);
    expect(result.state.secretWord.cards[0].markers).toBe(1);
    expect(result.state.declaredCount.get(FIRST.id)).toBe(1);
  });

  it('reveals the letter on the second marker and reports the card index', () => {
    const once = markObjective(buildState(), FIRST).state;
    const result = markObjective(once, FIRST);
    expect(result.revealedCardIndex).toBe(0);
    expect(result.state.secretWord.cards[0].revealed).toBe(true);
  });

  it('ignores marks on a revealed card so the count can always be undone', () => {
    const twice = markObjective(markObjective(buildState(), FIRST).state, FIRST).state;
    const result = markObjective(twice, FIRST);
    expect(result.applied).toBe(false);
    expect(result.state).toBe(twice);
    expect(twice.declaredCount.get(FIRST.id)).toBe(2);
  });

  it('is a no-op when the game is finished', () => {
    const state = { ...buildState(), finished: true };
    const result = markObjective(state, FIRST);
    expect(result.applied).toBe(false);
    expect(result.state).toBe(state);
  });
});

describe('unmarkObjective', () => {
  it('removes the marker and the declaration count', () => {
    const marked = markObjective(buildState(), FIRST).state;
    const undone = unmarkObjective(marked, FIRST);
    expect(undone.secretWord.cards[0].markers).toBe(0);
    expect(undone.declaredCount.get(FIRST.id)).toBe(0);
  });

  it('hides again a letter revealed by a mistaken mark', () => {
    const revealed = markObjective(markObjective(buildState(), FIRST).state, FIRST).state;
    const undone = unmarkObjective(revealed, FIRST);
    expect(undone.secretWord.cards[0].revealed).toBe(false);
    expect(undone.secretWord.cards[0].markers).toBe(1);
    expect(undone.declaredCount.get(FIRST.id)).toBe(1);
  });

  it('does nothing when the card has no markers', () => {
    const state = buildState();
    expect(unmarkObjective(state, FIRST)).toBe(state);
  });

  it('is a no-op when the game is finished', () => {
    const marked = { ...markObjective(buildState(), FIRST).state, finished: true };
    expect(unmarkObjective(marked, FIRST)).toBe(marked);
  });
});
