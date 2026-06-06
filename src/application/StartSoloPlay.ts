import { Board } from '@/domain/Board';
import { buildInitialObjectiveSlots, findAllSatisfied } from '@/domain/Objective';
import { buildSecretWord, WORD_LENGTH } from '@/domain/SecretWord';
import { buildCubes } from './CubeFactory';
import { Dependencies } from './Dependencies';
import { SoloPlayState } from './SoloPlayState';
import { buildAssignments } from './WordAssignment';

export function startSoloPlay(deps: Dependencies): SoloPlayState {
  const board: Board = {
    cubes: buildCubes(deps.random),
    lockedThisTurn: [],
    lockedNextTurn: [],
  };
  const objectives = buildInitialObjectiveSlots();
  const initialFreeObjectives = findAllSatisfied(board, objectives).length;
  const word = deps.wordRepository.randomWord();
  if (word.length !== WORD_LENGTH) {
    throw new Error(`WordRepository must yield ${WORD_LENGTH}-letter words, got "${word}"`);
  }
  const assignments = buildAssignments(word.split(''), deps.random);

  return {
    board,
    objectives,
    secretWord: buildSecretWord(assignments),
    turn: 0,
    initialFreeObjectives,
    canDeclareThisTurn: false,
    revealedThisTurn: false,
    finished: false,
    outcome: null,
    finalScore: null,
  };
}
