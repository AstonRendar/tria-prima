import { PlayerId } from '@/domain/Player';
import { canGuess, matchesGuess } from '@/domain/SecretWord';
import { currentOpponent, MatchState } from './MatchState';

// Solo se adivina al final de un turno en el que el jugador acaba de revelar
// una letra nueva del rival y ya tiene al menos 4 reveladas. Un único intento.
export function isMatchGuessAllowed(state: MatchState): boolean {
  if (state.finished || !state.revealedThisTurn) return false;
  return canGuess(currentOpponent(state).secretWord);
}

export function guessMatchWord(state: MatchState, guesser: PlayerId, input: string): MatchState {
  if (guesser !== state.currentPlayerId || !isMatchGuessAllowed(state)) return state;
  const won = matchesGuess(currentOpponent(state).secretWord, input);
  const loser: PlayerId = guesser === 'p1' ? 'p2' : 'p1';
  return {
    ...state,
    finished: true,
    outcome: (won ? guesser : loser) === 'p1' ? 'p1-wins' : 'p2-wins',
    failedGuessBy: won ? null : guesser,
  };
}
