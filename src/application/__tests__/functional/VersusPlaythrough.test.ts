import { endMatchTurn } from '@/application/EndMatchTurn';
import { buildAppTurnSteps, playAppTurn } from '@/application/PlayAppTurn';
import { rotateMatchCube } from '@/application/RotateMatchCube';
import { startVersusMatch } from '@/application/StartVersus';
import { findMatchedLine } from '@/domain/Objective';
import { revealedCount, SecretWord } from '@/domain/SecretWord';
import { StubRandom, StubWordRepository } from '../testdoubles';

function reveal(word: SecretWord, count: number): SecretWord {
  return {
    cards: word.cards.map((c, i) => (i < count ? { ...c, revealed: true } : c)),
  };
}

// Con StubRandom([0]) el humano (p1) abre la partida y el tablero es el
// CUBE_SET en orden: fila superior de azufres y fila inferior rubedo.
describe('versus playthrough', () => {
  const deps = () => ({
    random: new StubRandom([0]),
    wordRepository: new StubWordRepository('PUERTA', ['PUERTA', 'CAMINO']),
  });

  it('lets the app play a complete legal turn after the human', () => {
    const dependencies = deps();
    let state = startVersusMatch(dependencies, { playerName: 'Alice', playerWord: 'CAMINO', level: 'master' });
    expect(state.currentPlayerId).toBe('p1');

    // Turno del humano: dos giros y fin de turno.
    state = rotateMatchCube(state, 3, 'spin-cw');
    state = rotateMatchCube(state, 4, 'spin-cw');
    state = endMatchTurn(state);
    expect(state.currentPlayerId).toBe('p2');

    // Turno de la app: planifica, mueve, declara y cierra.
    const result = playAppTurn(state, dependencies);
    const steps = result.steps;
    state = result.state;

    expect(steps[steps.length - 1].kind).toBe('end-turn');

    // Cada acción viene precedida por la selección del dado que va a mover,
    // como haría un humano.
    const actionIndices = steps.flatMap((s, i) => (s.kind === 'action' ? [i] : []));
    expect(actionIndices.length).toBeGreaterThanOrEqual(1);
    for (const i of actionIndices) {
      const action = steps[i];
      if (action.kind !== 'action') continue;
      if (action.action.kind === 'swap') {
        expect(steps[i - 2]).toEqual({ kind: 'select', position: action.action.a });
        expect(steps[i - 1]).toEqual({ kind: 'select', position: action.action.b });
      } else {
        expect(steps[i - 1]).toEqual({ kind: 'select', position: action.action.position });
      }
    }
    expect(state.currentPlayerId).toBe('p1');
    expect(state.turn).toBe(2);
    expect(new Set(state.board.lockedThisTurn).size).toBe(2);
    expect(state.board.lockedThisTurn).not.toContain(3);
    expect(state.board.lockedThisTurn).not.toContain(4);
    expect(state.finished).toBe(false);

    // El tablero inicial ya cumplía azufre y rubedo: la app los declara
    // y marca las cartas del humano.
    const blocked = state.objectives.filter((s) => s.blockedBy === 'p2');
    expect(blocked.length).toBeGreaterThanOrEqual(2);
    const markers = state.players.p1.secretWord.cards.reduce((sum, c) => sum + c.markers, 0);
    expect(markers).toBeGreaterThanOrEqual(2);
  });

  it('does nothing when it is not the app turn', () => {
    const dependencies = deps();
    const state = startVersusMatch(dependencies, { playerName: 'Alice', playerWord: 'CAMINO', level: 'master' });
    expect(buildAppTurnSteps(state, dependencies)).toEqual([]);
  });

  it('does not guess at the start of its turn even with 4 letters revealed', () => {
    const dependencies = deps();
    let state = startVersusMatch(dependencies, { playerName: 'Alice', playerWord: 'CAMINO', level: 'master' });
    state = {
      ...state,
      currentPlayerId: 'p2',
      players: {
        ...state.players,
        p1: { ...state.players.p1, secretWord: reveal(state.players.p1.secretWord, 4) },
      },
    };
    const steps = buildAppTurnSteps(state, dependencies);
    expect(steps[0].kind).toBe('select');
  });

  it('guesses at the end of the turn in which it reveals a new letter', () => {
    const dependencies = deps();
    let state = startVersusMatch(dependencies, { playerName: 'Alice', playerWord: 'CAMINO', level: 'master' });
    const almost: SecretWord = {
      cards: state.players.p1.secretWord.cards.map((c, i) =>
        i < 4 ? { ...c, revealed: true } : { ...c, markers: 1 }
      ),
    };
    state = {
      ...state,
      currentPlayerId: 'p2',
      canDeclareThisTurn: true,
      players: { ...state.players, p1: { ...state.players.p1, secretWord: almost } },
    };

    const result = playAppTurn(state, dependencies);
    const kinds = result.steps.map((s) => s.kind);
    expect(kinds.indexOf('declare')).toBeLessThan(kinds.indexOf('guess'));
    expect(result.steps[result.steps.length - 1]).toEqual({ kind: 'guess', input: 'CAMINO' });
    expect(result.state.finished).toBe(true);
    expect(result.state.outcome).toBe('p2-wins');
  });
});

describe('versus playthrough when the app opens', () => {
  it('does not leave lines formed for the human in its first turn (it cannot declare yet)', () => {
    const dependencies = {
      random: new StubRandom([0]),
      wordRepository: new StubWordRepository('PUERTA', ['PUERTA', 'CAMINO']),
    };
    let state = startVersusMatch(dependencies, {
      playerName: 'Alice',
      playerWord: 'CAMINO',
      level: 'master',
      firstPlayer: 'p2',
    });
    expect(state.currentPlayerId).toBe('p2');
    const initialFormed = state.objectives.filter((s) => findMatchedLine(state.board, s.objective)).length;

    state = playAppTurn(state, dependencies).state;

    const formed = state.objectives.filter((s) => findMatchedLine(state.board, s.objective)).length;
    expect(formed).toBeLessThan(initialFormed);
  });
});
