import { declareSoloObjectives } from '@/application/DeclareSoloObjectives';
import { SoloPlayState } from '@/application/SoloPlayState';
import { Board } from '@/domain/Board';
import { Cube } from '@/domain/Cube';
import { Face } from '@/domain/Face';
import { buildSecretWord, CardAssignment, FaceSign, SecretWord } from '@/domain/SecretWord';

const SULFUR_FACE: Face = { symbol: 'sulfur', color: 'nigredo' };

function cubeWithTop(id: number, top: Face): Cube {
  return {
    id,
    orientation: { top, bottom: top, front: top, back: top, left: top, right: top },
  };
}

function boardWithRowOfSulfurs(): Board {
  return {
    cubes: [
      cubeWithTop(0, SULFUR_FACE),
      cubeWithTop(1, SULFUR_FACE),
      cubeWithTop(2, SULFUR_FACE),
      cubeWithTop(3, { symbol: 'salt', color: 'rubedo' }),
      cubeWithTop(4, { symbol: 'mercury', color: 'citrinitas' }),
      cubeWithTop(5, { symbol: 'salt', color: 'rubedo' }),
      cubeWithTop(6, { symbol: 'mercury', color: 'citrinitas' }),
      cubeWithTop(7, { symbol: 'salt', color: 'rubedo' }),
      cubeWithTop(8, { symbol: 'mercury', color: 'citrinitas' }),
    ],
    lockedThisTurn: [],
    lockedNextTurn: [],
  };
}

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

function withMarkers(word: SecretWord, index: number, markers: number): SecretWord {
  return {
    cards: word.cards.map((c, i) => (i === index ? { ...c, markers } : c)),
  };
}

function buildState(overrides: Partial<SoloPlayState> = {}): SoloPlayState {
  return {
    board: boardWithRowOfSulfurs(),
    objectives: [
      { objective: { id: 'sym:sulfur', kind: 'symbol', value: 'sulfur' }, blockedBy: null },
      { objective: { id: 'sym:salt', kind: 'symbol', value: 'salt' }, blockedBy: null },
    ],
    secretWord: buildSecretWord(assignments('CAMINO')),
    turn: 1,
    initialFreeObjectives: 0,
    canDeclareThisTurn: true,
    revealedThisTurn: false,
    finished: false,
    outcome: null,
    finalScore: null,
    ...overrides,
  };
}

describe('declareSoloObjectives', () => {
  it('blocks the fulfilled objective for the player', () => {
    const result = declareSoloObjectives(buildState());
    expect(result.declared).toBe(1);
    const sulfur = result.state.objectives.find((s) => s.objective.id === 'sym:sulfur');
    expect(sulfur?.blockedBy).toBe('p1');
  });

  it('marks the matched faceSign on the own secret word', () => {
    const result = declareSoloObjectives(buildState());
    expect(result.state.secretWord.cards[0].markers).toBe(1);
    expect(result.revealedCardIndices).toEqual([]);
  });

  it('reveals the letter on the second marker and reports the card index', () => {
    const seeded = withMarkers(buildSecretWord(assignments('CAMINO')), 0, 1);
    const result = declareSoloObjectives(buildState({ secretWord: seeded }));
    expect(result.revealedCardIndices).toEqual([0]);
    expect(result.state.secretWord.cards[0].revealed).toBe(true);
    expect(result.state.revealedThisTurn).toBe(true);
  });

  it('re-declares a kept objective, adding another marker', () => {
    const state = buildState({
      objectives: [
        { objective: { id: 'sym:sulfur', kind: 'symbol', value: 'sulfur' }, blockedBy: 'p1' },
      ],
    });
    const result = declareSoloObjectives(state);
    expect(result.declared).toBe(1);
    expect(result.state.secretWord.cards[0].markers).toBe(1);
  });

  it('releases own blocks that no longer match the board', () => {
    const result = declareSoloObjectives(
      buildState({
        objectives: [
          { objective: { id: 'sym:salt', kind: 'symbol', value: 'salt' }, blockedBy: 'p1' },
        ],
      })
    );
    expect(result.released).toBe(1);
    expect(result.state.objectives[0].blockedBy).toBe(null);
  });

  it('closes the declaration window after declaring', () => {
    const result = declareSoloObjectives(buildState());
    expect(result.state.canDeclareThisTurn).toBe(false);
  });

  it('does nothing while the declaration window is closed', () => {
    const state = buildState({ canDeclareThisTurn: false });
    const result = declareSoloObjectives(state);
    expect(result.declared).toBe(0);
    expect(result.state).toBe(state);
  });

  it('is a no-op when the game is finished', () => {
    const state = buildState({ finished: true });
    expect(declareSoloObjectives(state).state).toBe(state);
  });
});
