export type PlayerId = 'p1' | 'p2';

export const ALL_PLAYER_IDS: ReadonlyArray<PlayerId> = ['p1', 'p2'];

export function otherPlayer(id: PlayerId): PlayerId {
  return id === 'p1' ? 'p2' : 'p1';
}
