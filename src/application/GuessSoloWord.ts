import { computeScore } from '@/domain/Score';
import { canGuess, matchesGuess } from '@/domain/SecretWord';
import { SoloPlayState } from './SoloPlayState';

export function isSoloGuessAllowed(state: SoloPlayState): boolean {
  if (state.finished) return false;
  return canGuess(state.secretWord);
}

export function guessSoloWord(state: SoloPlayState, input: string): SoloPlayState {
  if (!isSoloGuessAllowed(state)) return state;
  const won = matchesGuess(state.secretWord, input);
  return {
    ...state,
    finished: true,
    outcome: won ? 'won' : 'lost',
    finalScore: computeScore(state.turn, state.initialFreeObjectives),
  };
}
