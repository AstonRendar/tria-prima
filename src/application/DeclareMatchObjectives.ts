import { findMatchedLine, ObjectiveSlot } from '@/domain/Objective';
import { otherPlayer } from '@/domain/Player';
import { addMarkerForObjective, SecretWord } from '@/domain/SecretWord';
import { MatchState } from './MatchState';

export type DeclareMatchResult = {
  state: MatchState;
  declared: number;
  released: number;
  revealedCardIndices: number[];
};

// Al cerrar la fase de declaración del jugador en turno:
//   1. Repasa sus objetivos bloqueados. Los que ya no se cumplen se liberan.
//   2. Considera "declarado" cada objetivo cumplido en el tablero que sea
//      suyo (mantenido) o esté disponible. Los del rival no se tocan.
//   3. Por cada declarado, marca la carta del rival cuya insignia coincida.
//      Mantener un objetivo varios turnos cuenta como declaraciones repetidas.
export function declareMatchObjectives(state: MatchState): DeclareMatchResult {
  if (state.finished) {
    return { state, declared: 0, released: 0, revealedCardIndices: [] };
  }
  if (!state.canDeclareThisTurn) {
    return { state, declared: 0, released: 0, revealedCardIndices: [] };
  }

  const me = state.currentPlayerId;
  const opponentId = otherPlayer(me);

  let released = 0;
  const matched: ObjectiveSlot[] = [];
  const objectives: ObjectiveSlot[] = state.objectives.map((slot) => {
    if (slot.blockedBy !== null && slot.blockedBy !== me) return slot;
    const isFulfilled = findMatchedLine(state.board, slot.objective) !== null;
    if (slot.blockedBy === me && !isFulfilled) {
      released++;
      return { ...slot, blockedBy: null };
    }
    if (isFulfilled) {
      const next: ObjectiveSlot = { ...slot, blockedBy: me };
      matched.push(next);
      return next;
    }
    return slot;
  });

  let opponentWord: SecretWord = state.players[opponentId].secretWord;
  const revealed: number[] = [];
  for (const m of matched) {
    const result = addMarkerForObjective(opponentWord, m.objective);
    if (result) {
      opponentWord = result.word;
      if (result.revealed) revealed.push(result.cardIndex);
    }
  }

  const nextState: MatchState = {
    ...state,
    objectives,
    players: {
      ...state.players,
      [opponentId]: {
        ...state.players[opponentId],
        secretWord: opponentWord,
      },
    },
    canDeclareThisTurn: false,
    revealedThisTurn: state.revealedThisTurn || revealed.length > 0,
  };

  return {
    state: nextState,
    declared: matched.length,
    released,
    revealedCardIndices: revealed,
  };
}
