import { AppTurnPlan, chooseAppGuess, planAppTurn } from '@/application/AppOpponent';
import { MatchState, PlayerData } from '@/application/MatchState';
import { Board, rotateCubeAt, swapPositions } from '@/domain/Board';
import { Cube } from '@/domain/Cube';
import { Face } from '@/domain/Face';
import { findMatchedLine, Objective } from '@/domain/Objective';
import { buildSecretWord, CardAssignment, FaceSign, SecretWord } from '@/domain/SecretWord';
import { StubRandom } from './testdoubles';

const SULFUR_N: Face = { symbol: 'sulfur', color: 'nigredo' };
const SULFUR_OBJECTIVE: Objective = { id: 'sym:sulfur', kind: 'symbol', value: 'sulfur' };

function cubeWithTop(id: number, top: Face): Cube {
  return {
    id,
    orientation: { top, bottom: top, front: top, back: top, left: top, right: top },
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

function reveal(word: SecretWord, indices: number[]): SecretWord {
  return {
    cards: word.cards.map((c, i) =>
      indices.includes(i) ? { ...c, revealed: true } : c
    ),
  };
}

function playerData(id: 'p1' | 'p2', name: string, word: string): PlayerData {
  return { id, name, secretWord: buildSecretWord(assignments(word)) };
}

// Tablero sin ninguna línea posible salvo la que se prepara a propósito:
// la fila superior tiene dos azufres y un dado cuya cara trasera es azufre
// (un roll-forward la sube). El resto de dados son uniformes y dispares.
function almostSulfurBoard(): Board {
  const nearly: Cube = {
    id: 2,
    orientation: {
      top: { symbol: 'salt', color: 'rubedo' },
      bottom: { symbol: 'salt', color: 'rubedo' },
      front: { symbol: 'mercury', color: 'citrinitas' },
      back: SULFUR_N,
      left: { symbol: 'salt', color: 'citrinitas' },
      right: { symbol: 'salt', color: 'citrinitas' },
    },
  };
  return {
    cubes: [
      cubeWithTop(0, SULFUR_N),
      cubeWithTop(1, SULFUR_N),
      nearly,
      cubeWithTop(3, { symbol: 'salt', color: 'citrinitas' }),
      cubeWithTop(4, { symbol: 'mercury', color: 'rubedo' }),
      cubeWithTop(5, { symbol: 'salt', color: 'nigredo' }),
      cubeWithTop(6, { symbol: 'mercury', color: 'nigredo' }),
      cubeWithTop(7, { symbol: 'sulfur', color: 'citrinitas' }),
      cubeWithTop(8, { symbol: 'mercury', color: 'rubedo' }),
    ],
    lockedThisTurn: [],
    lockedNextTurn: [],
  };
}

function buildState(overrides: Partial<MatchState> = {}): MatchState {
  return {
    players: {
      p1: playerData('p1', 'Alice', 'CAMINO'),
      p2: playerData('p2', 'Maestro', 'PUERTA'),
    },
    board: almostSulfurBoard(),
    objectives: [{ objective: SULFUR_OBJECTIVE, blockedBy: null }],
    currentPlayerId: 'p2',
    firstPlayerId: 'p1',
    turn: 1,
    canDeclareThisTurn: true,
    revealedThisTurn: false,
    finished: false,
    outcome: null,
    ...overrides,
  };
}

function applyPlan(board: Board, plan: AppTurnPlan): Board {
  let current = board;
  for (const action of plan.actions) {
    current =
      action.kind === 'swap'
        ? swapPositions(current, action.a, action.b)
        : rotateCubeAt(current, action.position, action.rotation);
  }
  return current;
}

describe('planAppTurn', () => {
  it('always touches exactly 2 distinct free cubes', () => {
    const plan = planAppTurn(buildState(), new StubRandom([0.37]));
    expect(new Set(plan.touched).size).toBe(2);
  });

  it('finds the move that completes an objective line', () => {
    const state = buildState();
    const plan = planAppTurn(state, new StubRandom([0.5]));
    const board = applyPlan(state.board, plan);
    expect(findMatchedLine(board, SULFUR_OBJECTIVE)).not.toBeNull();
  });

  it('never plans over locked cubes', () => {
    const state = buildState({
      board: { ...almostSulfurBoard(), lockedThisTurn: [0, 2] },
    });
    for (const seed of [0, 0.25, 0.5, 0.75, 0.99]) {
      const plan = planAppTurn(state, new StubRandom([seed]));
      expect(plan.touched).not.toContain(0);
      expect(plan.touched).not.toContain(2);
    }
  });

  it('lets the apprentice blunder into a random yet legal move', () => {
    // Primer next() < 0.5 → despiste: jugada cualquiera, pero siempre legal.
    const plan = planAppTurn(buildState(), new StubRandom([0.1, 0.6]), 'apprentice');
    expect(new Set(plan.touched).size).toBe(2);
  });

  it('makes the apprentice play its best move when focused', () => {
    // Primer next() >= 0.5 → juega como el maestro.
    const state = buildState();
    const plan = planAppTurn(state, new StubRandom([0.9, 0.2]), 'apprentice');
    expect(findMatchedLine(applyPlan(state.board, plan), SULFUR_OBJECTIVE)).not.toBeNull();
  });
});

describe('chooseAppGuess', () => {
  function stateWithRevealed(indices: number[]): MatchState {
    const p1 = playerData('p1', 'Alice', 'CAMINO');
    return buildState({
      players: {
        p1: { ...p1, secretWord: reveal(p1.secretWord, indices) },
        p2: playerData('p2', 'Maestro', 'PUERTA'),
      },
    });
  }

  it('does not guess with fewer than 4 letters revealed', () => {
    const state = stateWithRevealed([0, 1, 2]);
    expect(chooseAppGuess(state, ['CAMINO'], new StubRandom([0]))).toBe(null);
  });

  it('guesses the only candidate compatible with the revealed letters', () => {
    const state = stateWithRevealed([0, 1, 2, 3]);
    const words = ['CAMINO', 'PUERTA', 'CASTOR'];
    expect(chooseAppGuess(state, words, new StubRandom([0]))).toBe('CAMINO');
  });

  it('keeps playing when several candidates fit 4 revealed letters', () => {
    const state = stateWithRevealed([0, 1, 2, 3]);
    const words = ['CAMINO', 'CAMISA'];
    expect(chooseAppGuess(state, words, new StubRandom([0]))).toBe(null);
  });

  it('risks a candidate at random with 5 letters revealed', () => {
    const state = stateWithRevealed([0, 1, 2, 3, 4]);
    const words = ['CAMINO', 'CAMINA'];
    const guess = chooseAppGuess(state, words, new StubRandom([0]));
    expect(words).toContain(guess);
  });

  it('knows the word when all 6 letters are revealed, even outside the list', () => {
    const state = stateWithRevealed([0, 1, 2, 3, 4, 5]);
    expect(chooseAppGuess(state, [], new StubRandom([0]))).toBe('CAMINO');
  });

  it('keeps the apprentice from risking a single candidate with only 4 letters', () => {
    const state = stateWithRevealed([0, 1, 2, 3]);
    expect(chooseAppGuess(state, ['CAMINO'], new StubRandom([0]), 'apprentice')).toBe(null);
  });

  it('lets the apprentice guess the single candidate with 5 letters revealed', () => {
    const state = stateWithRevealed([0, 1, 2, 3, 4]);
    expect(chooseAppGuess(state, ['CAMINO'], new StubRandom([0]), 'apprentice')).toBe('CAMINO');
  });

  it('keeps the apprentice from gambling among several candidates', () => {
    const state = stateWithRevealed([0, 1, 2, 3, 4]);
    const words = ['CAMINO', 'CAMINA'];
    expect(chooseAppGuess(state, words, new StubRandom([0]), 'apprentice')).toBe(null);
  });
});
