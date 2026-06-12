import { endMatchTurn } from '@/application/EndMatchTurn';
import { buildAppTurnSteps, playAppTurn } from '@/application/PlayAppTurn';
import { rotateMatchCube } from '@/application/RotateMatchCube';
import { startVersusMatch } from '@/application/StartVersus';
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
    state = endMatchTurn(state, [3, 4]);
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
      const position = action.action.kind === 'swap' ? action.action.a : action.action.position;
      expect(steps[i - 1]).toEqual({ kind: 'select', position });
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

  it('guesses and wins when only one candidate fits the revealed letters', () => {
    const dependencies = deps();
    let state = startVersusMatch(dependencies, { playerName: 'Alice', playerWord: 'CAMINO', level: 'master' });
    state = {
      ...state,
      currentPlayerId: 'p2',
      players: {
        ...state.players,
        p1: {
          ...state.players.p1,
          secretWord: reveal(state.players.p1.secretWord, 4),
        },
      },
    };
    expect(revealedCount(state.players.p1.secretWord)).toBe(4);

    const result = playAppTurn(state, dependencies);
    expect(result.steps).toEqual([{ kind: 'guess', input: 'CAMINO' }]);
    expect(result.state.finished).toBe(true);
    expect(result.state.outcome).toBe('p2-wins');
  });
});
