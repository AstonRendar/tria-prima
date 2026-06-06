import { canGuess, matchesGuess } from '@/domain/SecretWord';
import { currentOpponent, MatchState } from './MatchState';

// Reglas: el jugador en turno puede intentar adivinar en cualquier momento de
// su propio turno, siempre que tenga al menos 4 letras reveladas del rival.
export function isMatchGuessAllowed(state: MatchState): boolean {
  if (state.finished) return false;
  return canGuess(currentOpponent(state).secretWord);
}

export function guessMatchWord(state: MatchState, input: string): MatchState {
  if (!isMatchGuessAllowed(state)) return state;
  const opponentWord = currentOpponent(state).secretWord;
  const won = matchesGuess(opponentWord, input);
  return {
    ...state,
    finished: true,
    outcome:
      (won && state.currentPlayerId === 'p1') || (!won && state.currentPlayerId === 'p2')
        ? 'p1-wins'
        : 'p2-wins',
  };
}
