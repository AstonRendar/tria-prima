import { declareMatchObjectives } from '@/application/DeclareMatchObjectives';
import { MatchState, PlayerData } from '@/application/MatchState';
import { Board } from '@/domain/Board';
import { Cube } from '@/domain/Cube';
import { Face } from '@/domain/Face';
import { ObjectiveSlot } from '@/domain/Objective';
import { buildSecretWord, CardAssignment, FaceSign } from '@/domain/SecretWord';

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

function playerData(id: 'p1' | 'p2', name: string): PlayerData {
  return { id, name, secretWord: buildSecretWord(assignments('CAMINO')) };
}

function buildState(overrides: Partial<MatchState> = {}): MatchState {
  return {
    players: { p1: playerData('p1', 'Alice'), p2: playerData('p2', 'Bob') },
    board: boardWithRowOfSulfurs(),
    objectives: [
      { objective: { id: 'sym:sulfur', kind: 'symbol', value: 'sulfur' }, blockedBy: null },
      { objective: { id: 'sym:salt', kind: 'symbol', value: 'salt' }, blockedBy: null },
    ],
    currentPlayerId: 'p1',
    firstPlayerId: 'p1',
    turn: 1,
    canDeclareThisTurn: true,
    revealedThisTurn: false,
    finished: false,
    outcome: null,
    ...overrides,
  };
}

describe('declareMatchObjectives', () => {
  it('attributes the blocked slot to the current player', () => {
    const state = buildState();
    const result = declareMatchObjectives(state);
    expect(result.declared).toBe(1);
    const sulfur = result.state.objectives.find((s) => s.objective.id === 'sym:sulfur');
    expect(sulfur?.blockedBy).toBe('p1');
  });

  it('marks the matched faceSign on the opponent secret word', () => {
    const state = buildState();
    const result = declareMatchObjectives(state);
    expect(result.state.players.p2.secretWord.cards[0].markers).toBe(1);
    expect(result.state.players.p1.secretWord.cards[0].markers).toBe(0);
  });

  it('releases own blocks that no longer match the board when declaring', () => {
    const state = buildState({
      objectives: [
        { objective: { id: 'sym:sulfur', kind: 'symbol', value: 'sulfur' }, blockedBy: null },
        // El star bloqueado de un turno anterior ya no se cumple en este tablero
        // (no hay tres estrellas alineadas) → debe liberarse.
        { objective: { id: 'sym:salt', kind: 'symbol', value: 'salt' }, blockedBy: 'p1' },
      ],
    });
    const result = declareMatchObjectives(state);
    const salt = result.state.objectives.find((s) => s.objective.id === 'sym:salt');
    expect(salt?.blockedBy).toBe(null);
    expect(result.released).toBe(1);
  });

  it('releases own broken blocks even when no new objective is achieved', () => {
    // Tablero sin ninguna alineación posible.
    const board: Board = {
      cubes: [
        cubeWithTop(0, { symbol: 'sulfur', color: 'rubedo' }),
        cubeWithTop(1, { symbol: 'salt', color: 'citrinitas' }),
        cubeWithTop(2, { symbol: 'mercury', color: 'nigredo' }),
        cubeWithTop(3, { symbol: 'salt', color: 'citrinitas' }),
        cubeWithTop(4, { symbol: 'mercury', color: 'rubedo' }),
        cubeWithTop(5, { symbol: 'sulfur', color: 'nigredo' }),
        cubeWithTop(6, { symbol: 'mercury', color: 'nigredo' }),
        cubeWithTop(7, { symbol: 'sulfur', color: 'citrinitas' }),
        cubeWithTop(8, { symbol: 'salt', color: 'rubedo' }),
      ],
      lockedThisTurn: [],
      lockedNextTurn: [],
    };
    const state = buildState({
      board,
      objectives: [
        { objective: { id: 'sym:sulfur', kind: 'symbol', value: 'sulfur' }, blockedBy: 'p1' },
        { objective: { id: 'col:rubedo', kind: 'color', value: 'rubedo' }, blockedBy: 'p1' },
      ],
    });
    const result = declareMatchObjectives(state);
    expect(result.declared).toBe(0);
    expect(result.released).toBe(2);
    expect(result.state.objectives.every((s) => s.blockedBy === null)).toBe(true);
    // Cierra la ventana de declaración para no volver a procesarlo en el mismo turno.
    expect(result.state.canDeclareThisTurn).toBe(false);
  });

  it('re-declares own blocks that still match the board, marking the opponent again', () => {
    // El azufre sigue cumpliéndose: mantenerlo cuenta como declaración repetida.
    const board: Board = {
      cubes: [
        cubeWithTop(0, SULFUR_FACE),
        cubeWithTop(1, SULFUR_FACE),
        cubeWithTop(2, SULFUR_FACE),
        cubeWithTop(3, { symbol: 'salt', color: 'rubedo' }),
        cubeWithTop(4, { symbol: 'mercury', color: 'citrinitas' }),
        cubeWithTop(5, { symbol: 'salt', color: 'nigredo' }),
        cubeWithTop(6, { symbol: 'mercury', color: 'rubedo' }),
        cubeWithTop(7, { symbol: 'salt', color: 'citrinitas' }),
        cubeWithTop(8, { symbol: 'mercury', color: 'nigredo' }),
      ],
      lockedThisTurn: [],
      lockedNextTurn: [],
    };
    const state = buildState({
      board,
      objectives: [
        { objective: { id: 'sym:sulfur', kind: 'symbol', value: 'sulfur' }, blockedBy: 'p1' },
      ],
    });
    const result = declareMatchObjectives(state);
    expect(result.declared).toBe(1);
    expect(result.released).toBe(0);
    const sulfur = result.state.objectives.find((s) => s.objective.id === 'sym:sulfur');
    expect(sulfur?.blockedBy).toBe('p1');
    expect(result.state.players.p2.secretWord.cards[0].markers).toBe(1);
  });

  it('keeps own blocks that still match the board when declaring a new one', () => {
    // Tablero satisface a la vez "azufre" (fila superior) y "mercurio" (fila inferior).
    const board: Board = {
      cubes: [
        cubeWithTop(0, SULFUR_FACE),
        cubeWithTop(1, SULFUR_FACE),
        cubeWithTop(2, SULFUR_FACE),
        cubeWithTop(3, { symbol: 'salt', color: 'rubedo' }),
        cubeWithTop(4, { symbol: 'salt', color: 'citrinitas' }),
        cubeWithTop(5, { symbol: 'salt', color: 'nigredo' }),
        cubeWithTop(6, { symbol: 'mercury', color: 'citrinitas' }),
        cubeWithTop(7, { symbol: 'mercury', color: 'citrinitas' }),
        cubeWithTop(8, { symbol: 'mercury', color: 'citrinitas' }),
      ],
      lockedThisTurn: [],
      lockedNextTurn: [],
    };
    const state = buildState({
      board,
      objectives: [
        // azufre ya estaba bloqueado por p1 en un turno anterior y SIGUE cumpliéndose.
        { objective: { id: 'sym:sulfur', kind: 'symbol', value: 'sulfur' }, blockedBy: 'p1' },
        // mercurio está disponible y se cumple ahora.
        { objective: { id: 'sym:mercury', kind: 'symbol', value: 'mercury' }, blockedBy: null },
      ],
    });
    const result = declareMatchObjectives(state);

    const sulfur = result.state.objectives.find((s) => s.objective.id === 'sym:sulfur');
    const moon = result.state.objectives.find((s) => s.objective.id === 'sym:mercury');
    expect(sulfur?.blockedBy).toBe('p1');
    expect(moon?.blockedBy).toBe('p1');
  });

  it('does not touch the opponent blocks', () => {
    const state = buildState({
      objectives: [
        { objective: { id: 'sym:sulfur', kind: 'symbol', value: 'sulfur' }, blockedBy: null },
        { objective: { id: 'sym:salt', kind: 'symbol', value: 'salt' }, blockedBy: 'p2' },
      ],
    });
    const result = declareMatchObjectives(state);
    const salt = result.state.objectives.find((s) => s.objective.id === 'sym:salt');
    expect(salt?.blockedBy).toBe('p2');
  });

  it('does nothing during the first turn (canDeclareThisTurn=false)', () => {
    const state = buildState({ canDeclareThisTurn: false });
    const result = declareMatchObjectives(state);
    expect(result.declared).toBe(0);
    expect(result.state).toBe(state);
  });

  it('closes the declaration window after declaring', () => {
    const state = buildState();
    const result = declareMatchObjectives(state);
    expect(result.state.canDeclareThisTurn).toBe(false);
  });
});
