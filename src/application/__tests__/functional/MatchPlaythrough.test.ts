import { declareMatchObjectives } from '@/application/DeclareMatchObjectives';
import { endMatchTurn } from '@/application/EndMatchTurn';
import { guessMatchWord, isMatchGuessAllowed } from '@/application/GuessMatchWord';
import { rotateMatchCube } from '@/application/RotateMatchCube';
import { startMatch } from '@/application/StartMatch';
import { swapMatchCubes } from '@/application/SwapMatchCubes';
import { revealedCount } from '@/domain/SecretWord';
import { StubRandom, StubWordRepository } from '../testdoubles';

// Con StubRandom([0]) el tablero inicial es el CUBE_SET en orden y sin girar:
// la fila superior alinea tres azufres y la inferior tres caras rubedo.
describe('duel playthrough', () => {
  it('plays several full turns keeping the rules consistent', () => {
    let state = startMatch(
      { random: new StubRandom([0]), wordRepository: new StubWordRepository('CAMINO') },
      { p1Name: 'Alice', p2Name: 'Bob', p1Word: 'CAMINO', p2Word: 'PUERTA' }
    );

    expect(state.currentPlayerId).toBe('p1');
    expect(state.canDeclareThisTurn).toBe(false);

    // Turno 0 (p1): solo manipulación. Gira dos dados de la fila central.
    state = rotateMatchCube(state, 3, 'spin-cw');
    state = rotateMatchCube(state, 4, 'spin-cw');
    state = endMatchTurn(state, [3, 4]);

    expect(state.currentPlayerId).toBe('p2');
    expect(state.turn).toBe(1);
    expect(state.board.lockedThisTurn).toEqual([3, 4]);

    // Turno 1 (p2): los dados que tocó p1 están bloqueados.
    expect(swapMatchCubes(state, 3, 4).applied).toBe(false);
    expect(rotateMatchCube(state, 3, 'roll-forward').board).toBe(state.board);

    // Intercambia dentro de la fila superior: la línea de azufres sobrevive.
    const swap = swapMatchCubes(state, 0, 1);
    expect(swap.applied).toBe(true);
    state = swap.state;

    // Declara: azufre (fila superior) y rubedo (fila inferior) pasan a su zona.
    const firstDeclare = declareMatchObjectives(state);
    state = firstDeclare.state;
    expect(firstDeclare.declared).toBe(2);
    const blocked = state.objectives
      .filter((s) => s.blockedBy === 'p2')
      .map((s) => s.objective.id);
    expect(blocked.sort()).toEqual(['col:rubedo', 'sym:sulfur']);

    // Cada declaración marca la carta de p1 con la insignia coincidente.
    expect(state.players.p1.secretWord.cards.filter((c) => c.markers === 1)).toHaveLength(2);
    expect(state.players.p2.secretWord.cards.every((c) => c.markers === 0)).toBe(true);

    state = endMatchTurn(state, [0, 1]);
    expect(state.currentPlayerId).toBe('p1');
    expect(state.board.lockedThisTurn).toEqual([0, 1]);

    // Turno 2 (p1): los objetivos bloqueados por p2 no se pueden robar.
    state = rotateMatchCube(state, 8, 'spin-cw');
    state = rotateMatchCube(state, 5, 'spin-ccw');
    const p1Declare = declareMatchObjectives(state);
    state = p1Declare.state;
    expect(p1Declare.declared).toBe(0);
    expect(state.objectives.filter((s) => s.blockedBy === 'p2')).toHaveLength(2);
    state = endMatchTurn(state, [8, 5]);

    // Turno 3 (p2): mantener las líneas re-declara y revela dos letras de p1.
    const secondDeclare = declareMatchObjectives(state);
    state = secondDeclare.state;
    expect(secondDeclare.declared).toBe(2);
    expect(secondDeclare.revealedCardIndices).toHaveLength(2);
    expect(revealedCount(state.players.p1.secretWord)).toBe(2);

    // Con menos de 4 letras reveladas no se permite adivinar.
    expect(isMatchGuessAllowed(state)).toBe(false);
    expect(guessMatchWord(state, 'CAMINO')).toBe(state);
    expect(state.finished).toBe(false);
  });
});
