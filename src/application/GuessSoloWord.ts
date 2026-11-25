import { computeScore } from '@/domain/Score';
import { canGuess, matchesGuess } from '@/domain/SecretWord';
import { SoloPlayState } from './SoloPlayState';

// Misma regla que en el duelo: solo al final de un turno en el que se acaba de
// revelar una letra, con 4 o más reveladas.
export function isSoloGuessAllowed(state: SoloPlayState): boolean {
  if (state.finished || !state.revealedThisTurn) return false;
  return canGuess(state.secretWord);
}

// `turn` cuenta los turnos ya cerrados; el turno en curso también se ha jugado.
export function guessSoloWord(state: SoloPlayState, input: string): SoloPlayState {
  if (!isSoloGuessAllowed(state)) return state;
  const won = matchesGuess(state.secretWord, input);
  return {
    ...state,
    finished: true,
    outcome: won ? 'won' : 'lost',
    finalScore: computeScore(state.turn + 1, state.initialFreeObjectives),
  };
}
