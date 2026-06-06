import { canGuess, matchesGuess } from '@/domain/SecretWord';
import { TrackerState } from './TrackerState';

export function canGuessTracker(state: TrackerState): boolean {
  return !state.finished && canGuess(state.secretWord);
}

export function guessTracker(state: TrackerState, input: string): TrackerState {
  if (state.finished) return state;
  if (!canGuess(state.secretWord)) return state;
  const won = matchesGuess(state.secretWord, input);
  return {
    ...state,
    finished: true,
    outcome: won ? 'won' : 'lost',
  };
}
