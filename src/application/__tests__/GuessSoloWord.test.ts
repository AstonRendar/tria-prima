import { guessSoloWord, isSoloGuessAllowed } from '@/application/GuessSoloWord';
import { SoloPlayState } from '@/application/SoloPlayState';
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
  return {
    cards: word.cards.map((c, i) =>
      indices.includes(i) ? { ...c, revealed: true } : c
    ),
  };
}

function buildState(overrides: Partial<SoloPlayState> = {}): SoloPlayState {
  return {
    board: { cubes: [], lockedThisTurn: [], lockedNextTurn: [] },
    objectives: [],
    secretWord: buildSecretWord(assignments('CAMINO')),
    turn: 5,
    initialFreeObjectives: 2,
    canDeclareThisTurn: false,
    revealedThisTurn: false,
    finished: false,
    outcome: null,
    finalScore: null,
    ...overrides,
  };
}

describe('guessSoloWord', () => {
  it('refuses to guess when fewer than 4 letters are revealed', () => {
    const state = buildState({
      secretWord: reveal(buildSecretWord(assignments('CAMINO')), [0, 1, 2]),
    });
    expect(isSoloGuessAllowed(state)).toBe(false);
  });

  it('marks the game as won and computes the score on correct guess', () => {
    const state = buildState({
      secretWord: reveal(buildSecretWord(assignments('CAMINO')), [0, 1, 2, 3]),
      turn: 6,
      initialFreeObjectives: 1,
    });
    const result = guessSoloWord(state, 'camíno');
    expect(result.finished).toBe(true);
    expect(result.outcome).toBe('won');
    expect(result.finalScore).toBe(7);
  });

  it('marks the game as lost on a wrong guess and still computes the score', () => {
    const state = buildState({
      secretWord: reveal(buildSecretWord(assignments('CAMINO')), [0, 1, 2, 3]),
      turn: 9,
      initialFreeObjectives: 2,
    });
    const result = guessSoloWord(state, 'OTRO');
    expect(result.finished).toBe(true);
    expect(result.outcome).toBe('lost');
    expect(result.finalScore).toBe(11);
  });

  it('is a no-op when the game is already finished', () => {
    const state = { ...buildState(), finished: true };
    const result = guessSoloWord(state, 'CAMINO');
    expect(result).toBe(state);
  });
});
