import { Board } from '@/domain/Board';
import { ObjectiveSlot } from '@/domain/Objective';
import { PlayerId } from '@/domain/Player';
import { SecretWord } from '@/domain/SecretWord';

export type MatchOutcome = 'p1-wins' | 'p2-wins';

export type PlayerData = {
  readonly id: PlayerId;
  readonly name: string;
  readonly secretWord: SecretWord;
};

export type Players = {
  readonly p1: PlayerData;
  readonly p2: PlayerData;
};

export type MatchState = {
  readonly players: Players;
  readonly board: Board;
  readonly objectives: ReadonlyArray<ObjectiveSlot>;
  readonly currentPlayerId: PlayerId;
  readonly firstPlayerId: PlayerId;
  readonly turn: number;
  readonly canDeclareThisTurn: boolean;
  readonly revealedThisTurn: boolean;
  readonly finished: boolean;
  readonly outcome: MatchOutcome | null;
};

export function opponentOf(state: MatchState, id: PlayerId): PlayerData {
  return id === 'p1' ? state.players.p2 : state.players.p1;
}

export function currentPlayer(state: MatchState): PlayerData {
  return state.players[state.currentPlayerId];
}

export function currentOpponent(state: MatchState): PlayerData {
  return opponentOf(state, state.currentPlayerId);
}
