import { declareSoloObjectives } from '@/application/DeclareSoloObjectives';
import { endSoloTurn } from '@/application/EndSoloTurn';
import { guessSoloWord, isSoloGuessAllowed } from '@/application/GuessSoloWord';
import { rotateSoloCube } from '@/application/RotateSoloCube';
import { startSoloPlay } from '@/application/StartSoloPlay';
import { swapSoloCubes } from '@/application/SwapSoloCubes';
import { revealedCount } from '@/domain/SecretWord';
import { StubRandom, StubWordRepository } from '../testdoubles';

// Con StubRandom([0]) el tablero inicial es el CUBE_SET en orden y sin girar:
// la fila superior alinea tres azufres y la inferior tres caras rubedo.
describe('solo playthrough', () => {
  it('plays a digital solo game from setup to the guess gate', () => {
    let state = startSoloPlay({
      random: new StubRandom([0]),
      wordRepository: new StubWordRepository('CAMINO'),
    });

    expect(state.initialFreeObjectives).toBe(2);
    expect(state.turn).toBe(0);
    expect(state.canDeclareThisTurn).toBe(false);

    // Turno 0: solo manipulación. Gira dos dados de la fila central.
    state = rotateSoloCube(state, 3, 'spin-cw');
    state = rotateSoloCube(state, 4, 'spin-cw');
    state = endSoloTurn(state, [3, 4]);
    expect(state.turn).toBe(1);
    expect(state.board.lockedThisTurn).toEqual([3, 4]);

    // Turno 1: los dados tocados el turno anterior no responden.
    expect(swapSoloCubes(state, 3, 4).applied).toBe(false);

    const firstDeclare = declareSoloObjectives(state);
    state = firstDeclare.state;
    expect(firstDeclare.declared).toBe(2);
    expect(state.objectives.filter((s) => s.blockedBy === 'p1')).toHaveLength(2);
    expect(state.secretWord.cards.filter((c) => c.markers === 1)).toHaveLength(2);

    state = rotateSoloCube(state, 5, 'spin-cw');
    state = rotateSoloCube(state, 8, 'spin-ccw');
    state = endSoloTurn(state, [5, 8]);

    // Turno 2: mantener las líneas re-declara y revela las dos letras.
    const secondDeclare = declareSoloObjectives(state);
    state = secondDeclare.state;
    expect(secondDeclare.declared).toBe(2);
    expect(secondDeclare.revealedCardIndices).toHaveLength(2);
    expect(revealedCount(state.secretWord)).toBe(2);
    expect(state.revealedThisTurn).toBe(true);

    // Dos letras no bastan para adivinar.
    expect(isSoloGuessAllowed(state)).toBe(false);
    expect(guessSoloWord(state, 'CAMINO')).toBe(state);
    expect(state.finished).toBe(false);
  });
});
