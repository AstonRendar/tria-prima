import { guessMatchWord, isMatchGuessAllowed } from '@/application/GuessMatchWord';
import { MatchState, PlayerData } from '@/application/MatchState';
import { buildSecretWord, CardAssignment, FaceSign, SecretWord } from '@/domain/SecretWord';

const FACE_SIGNS: FaceSign[] = [
  { kind: 'symbol', value: 'sulfur' },
  { kind: 'symbol', value: 'salt' },
  { kind: 'symbol', value: 'mercury' },
  { kind: 'color', value: 'nigredo' },
  { kind: 'color', value: 'rubedo' },
  { kind: 'color', value: 'citrinitas' },
];

function assignments(word: string): CardAssignment[] {
  return word.split('').map((letter, i) => ({ letter, faceSign: FACE_SIGNS[i] }));
}

function reveal(word: SecretWord, indices: number[]): SecretWord {
  return { cards: word.cards.map((c, i) => (indices.includes(i) ? { ...c, revealed: true } : c)) };
}

function playerData(id: 'p1' | 'p2', name: string, word: string): PlayerData {
  return { id, name, secretWord: buildSecretWord(assignments(word)) };
}

function buildState(overrides: Partial<MatchState> = {}): MatchState {
  return {
    players: { p1: playerData('p1', 'Alice', 'PUERTA'), p2: playerData('p2', 'Bob', 'CAMINO') },
    board: { cubes: [], lockedThisTurn: [], touchedThisTurn: [] },
    objectives: [],
    currentPlayerId: 'p1',
    firstPlayerId: 'p1',
    turn: 3,
    canDeclareThisTurn: false,
    revealedThisTurn: false,
    finished: false,
    outcome: null,
    failedGuessBy: null,
    ...overrides,
  };
}

describe('guessMatchWord', () => {
  it('refuses to guess when fewer than 4 letters of the opponent are revealed', () => {
    const opponent = playerData('p2', 'Bob', 'CAMINO');
    const state = buildState({
      players: { p1: playerData('p1', 'A', 'PUERTA'), p2: { ...opponent, secretWord: reveal(opponent.secretWord, [0, 1, 2]) } },
    });
    expect(isMatchGuessAllowed(state)).toBe(false);
  });

  it('allows guessing with 4 letters revealed at the end of a turn that revealed a new letter', () => {
    const opponent = playerData('p2', 'Bob', 'CAMINO');
    const state = buildState({
      players: { p1: playerData('p1', 'A', 'PUERTA'), p2: { ...opponent, secretWord: reveal(opponent.secretWord, [0, 1, 2, 3]) } },
      revealedThisTurn: true,
    });
    expect(isMatchGuessAllowed(state)).toBe(true);
  });

  it('refuses to guess in a turn that did not reveal a new letter', () => {
    const opponent = playerData('p2', 'Bob', 'CAMINO');
    const state = buildState({
      players: { p1: playerData('p1', 'A', 'PUERTA'), p2: { ...opponent, secretWord: reveal(opponent.secretWord, [0, 1, 2, 3]) } },
      revealedThisTurn: false,
    });
    expect(isMatchGuessAllowed(state)).toBe(false);
  });

  it('ignores a guess from the player who is not in turn', () => {
    const opponent = playerData('p2', 'Bob', 'CAMINO');
    const state = buildState({
      players: { p1: playerData('p1', 'A', 'PUERTA'), p2: { ...opponent, secretWord: reveal(opponent.secretWord, [0, 1, 2, 3]) } },
      revealedThisTurn: true,
    });
    expect(guessMatchWord(state, 'p2', 'PUERTA')).toBe(state);
  });

  it('refuses to guess when the game is already finished', () => {
    const opponent = playerData('p2', 'Bob', 'CAMINO');
    const state = buildState({
      players: { p1: playerData('p1', 'A', 'PUERTA'), p2: { ...opponent, secretWord: reveal(opponent.secretWord, [0, 1, 2, 3]) } },
      finished: true,
      revealedThisTurn: true,
    });
    expect(isMatchGuessAllowed(state)).toBe(false);
  });

  it('marks p1 as winner when p1 guesses the opponent word correctly', () => {
    const opponent = playerData('p2', 'Bob', 'CAMINO');
    const state = buildState({
      currentPlayerId: 'p1',
      revealedThisTurn: true,
      players: { p1: playerData('p1', 'Alice', 'PUERTA'), p2: { ...opponent, secretWord: reveal(opponent.secretWord, [0, 1, 2, 3]) } },
    });
    const result = guessMatchWord(state, 'p1', 'camino');
    expect(result.finished).toBe(true);
    expect(result.outcome).toBe('p1-wins');
    expect(result.failedGuessBy).toBe(null);
  });

  it('marks p2 as winner when p1 fails the guess', () => {
    const opponent = playerData('p2', 'Bob', 'CAMINO');
    const state = buildState({
      currentPlayerId: 'p1',
      revealedThisTurn: true,
      players: { p1: playerData('p1', 'Alice', 'PUERTA'), p2: { ...opponent, secretWord: reveal(opponent.secretWord, [0, 1, 2, 3]) } },
    });
    const result = guessMatchWord(state, 'p1', 'OTRO');
    expect(result.outcome).toBe('p2-wins');
    expect(result.failedGuessBy).toBe('p1');
  });
});
