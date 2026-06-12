import { AppLevel } from './AppOpponent';
import { Dependencies } from './Dependencies';
import { MatchState } from './MatchState';
import { startMatch } from './StartMatch';

export const APP_PLAYER_NAME = 'El maestro';

export type VersusSetup = {
  readonly playerName: string;
  readonly playerWord: string;
  readonly level: AppLevel;
};

// Duelo contra la app: el humano es p1 y la app (p2) esconde una palabra de
// la lista. El primer turno se sortea igual que en el duelo a dos.
export function startVersusMatch(deps: Dependencies, setup: VersusSetup): MatchState {
  return startMatch(deps, {
    p1Name: setup.playerName,
    p2Name: APP_PLAYER_NAME,
    p1Word: setup.playerWord,
    p2Word: deps.wordRepository.randomWord(),
  });
}
