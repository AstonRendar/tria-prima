import { markObjective } from '@/application/MarkObjective';
import { startTracker } from '@/application/StartTracker';
import { canGuessTracker, guessTracker } from '@/application/TrackerActions';
import { TrackerState } from '@/application/TrackerState';
import { ALL_OBJECTIVES } from '@/domain/Objective';
import { StubRandom, StubWordRepository } from './testdoubles';

function buildState() {
  return startTracker({
    random: new StubRandom([0]),
    wordRepository: new StubWordRepository('CAMINO'),
  });
}

function revealLetters(state: TrackerState, count: number): TrackerState {
  let current = state;
  for (const objective of ALL_OBJECTIVES.slice(0, count)) {
    current = markObjective(markObjective(current, objective).state, objective).state;
  }
  return current;
}

describe('canGuessTracker', () => {
  it('refuses the guess with fewer than 4 letters revealed', () => {
    expect(canGuessTracker(revealLetters(buildState(), 3))).toBe(false);
  });

  it('allows the guess with 4 letters revealed', () => {
    expect(canGuessTracker(revealLetters(buildState(), 4))).toBe(true);
  });

  it('refuses the guess when the game is finished', () => {
    const state = { ...revealLetters(buildState(), 4), finished: true };
    expect(canGuessTracker(state)).toBe(false);
  });
});

describe('guessTracker', () => {
  it('wins on the correct word, ignoring case and accents', () => {
    const state = guessTracker(revealLetters(buildState(), 4), 'camíno');
    expect(state.finished).toBe(true);
    expect(state.outcome).toBe('won');
  });

  it('loses on a wrong word', () => {
    const state = guessTracker(revealLetters(buildState(), 4), 'PUERTA');
    expect(state.finished).toBe(true);
    expect(state.outcome).toBe('lost');
  });

  it('does nothing when fewer than 4 letters are revealed', () => {
    const state = revealLetters(buildState(), 2);
    expect(guessTracker(state, 'CAMINO')).toBe(state);
  });

  it('is a no-op when the game is finished', () => {
    const state = { ...revealLetters(buildState(), 4), finished: true };
    expect(guessTracker(state, 'CAMINO')).toBe(state);
  });
});
