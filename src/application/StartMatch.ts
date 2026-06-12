import { Board } from '@/domain/Board';
import { buildInitialObjectiveSlots } from '@/domain/Objective';
import { PlayerId } from '@/domain/Player';
import { buildSecretWord, normalizeGuess, WORD_LENGTH } from '@/domain/SecretWord';
import { buildCubes } from './CubeFactory';
import { Dependencies } from './Dependencies';
import { MatchState, PlayerData } from './MatchState';
import { buildAssignments } from './WordAssignment';

export type FirstPlayerChoice = PlayerId | 'random';

export type MatchSetup = {
  readonly p1Name: string;
  readonly p2Name: string;
  readonly p1Word: string;
  readonly p2Word: string;
  readonly firstPlayer?: FirstPlayerChoice;
};

export function startMatch(deps: Dependencies, setup: MatchSetup): MatchState {
  const board: Board = {
    cubes: buildCubes(deps.random),
    lockedThisTurn: [],
    lockedNextTurn: [],
  };
  const p1 = buildPlayerData('p1', setup.p1Name, setup.p1Word, deps);
  const p2 = buildPlayerData('p2', setup.p2Name, setup.p2Word, deps);
  const firstPlayerId = resolveFirstPlayer(setup.firstPlayer ?? 'random', deps);

  return {
    players: { p1, p2 },
    board,
    objectives: buildInitialObjectiveSlots(),
    currentPlayerId: firstPlayerId,
    firstPlayerId,
    turn: 0,
    canDeclareThisTurn: false,
    revealedThisTurn: false,
    finished: false,
    outcome: null,
  };
}

function resolveFirstPlayer(choice: FirstPlayerChoice, deps: Dependencies): PlayerId {
  if (choice !== 'random') return choice;
  return deps.random.pickIndex(2) === 0 ? 'p1' : 'p2';
}

function buildPlayerData(
  id: PlayerId,
  name: string,
  rawWord: string,
  deps: Dependencies
): PlayerData {
  const normalized = normalizeGuess(rawWord);
  if (normalized.length !== WORD_LENGTH) {
    throw new Error(
      `Palabra de ${name} inválida: debe tener ${WORD_LENGTH} letras tras normalizar`
    );
  }
  const assignments = buildAssignments(normalized.split(''), deps.random);
  return { id, name, secretWord: buildSecretWord(assignments) };
}
