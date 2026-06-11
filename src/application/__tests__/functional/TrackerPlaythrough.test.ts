import { markObjective, unmarkObjective } from '@/application/MarkObjective';
import { startTracker } from '@/application/StartTracker';
import { canGuessTracker, guessTracker } from '@/application/TrackerActions';
import { ALL_OBJECTIVES } from '@/domain/Objective';
import { maskedText, revealedCount } from '@/domain/SecretWord';
import { StubRandom, StubWordRepository } from '../testdoubles';

// Con StubRandom el shuffle es la identidad: la carta i lleva el signo ALL_OBJECTIVES[i].
describe('tracker playthrough', () => {
  function start() {
    return startTracker({
      random: new StubRandom([0]),
      wordRepository: new StubWordRepository('CAMINO'),
    });
  }

  it('tracks a physical game up to a winning guess', () => {
    let state = start();

    // Una marca por error se compensa con la resta.
    state = markObjective(state, ALL_OBJECTIVES[5]).state;
    state = unmarkObjective(state, ALL_OBJECTIVES[5]);
    expect(state.secretWord.cards[5].markers).toBe(0);

    // Cumple 4 objetivos dos veces cada uno → 4 letras reveladas.
    for (const objective of ALL_OBJECTIVES.slice(0, 4)) {
      expect(canGuessTracker(state)).toBe(false);
      state = markObjective(state, objective).state;
      const second = markObjective(state, objective);
      expect(second.revealedCardIndex).not.toBe(null);
      state = second.state;
    }

    expect(revealedCount(state.secretWord)).toBe(4);
    expect(maskedText(state.secretWord)).toBe('C A M I _ _');
    expect(canGuessTracker(state)).toBe(true);

    state = guessTracker(state, ' camíno ');
    expect(state.finished).toBe(true);
    expect(state.outcome).toBe('won');

    // La partida terminada queda congelada.
    expect(markObjective(state, ALL_OBJECTIVES[4]).applied).toBe(false);
  });

  it('ends as lost on a wrong guess', () => {
    let state = start();
    for (const objective of ALL_OBJECTIVES.slice(0, 4)) {
      state = markObjective(markObjective(state, objective).state, objective).state;
    }
    state = guessTracker(state, 'PUERTA');
    expect(state.finished).toBe(true);
    expect(state.outcome).toBe('lost');
  });
});
