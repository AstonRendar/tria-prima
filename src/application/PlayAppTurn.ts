import { Position } from '@/domain/Position';
import { AppAction, AppLevel, chooseAppGuess, planAppTurn } from './AppOpponent';
import { declareMatchObjectives } from './DeclareMatchObjectives';
import { Dependencies } from './Dependencies';
import { endMatchTurn } from './EndMatchTurn';
import { guessMatchWord, isMatchGuessAllowed } from './GuessMatchWord';
import { MatchState } from './MatchState';
import { rotateMatchCube } from './RotateMatchCube';
import { swapMatchCubes } from './SwapMatchCubes';

export type AppTurnStep =
  | { kind: 'guess'; input: string }
  | { kind: 'select'; position: Position }
  | { kind: 'action'; action: AppAction }
  | { kind: 'declare' }
  | { kind: 'end-turn' };

// Construye el turno completo de la app como una lista de pasos. La UI los
// reproduce uno a uno (con retardo para que se vea la jugada) aplicando
// applyAppStep; los tests pueden plegarlos de una vez.
export function buildAppTurnSteps(
  state: MatchState,
  deps: Dependencies,
  level: AppLevel = 'master'
): AppTurnStep[] {
  if (state.finished || state.currentPlayerId !== 'p2') return [];
  const plan = planAppTurn(state, deps.random, level);
  const moves: AppTurnStep[] = [
    // Antes de cada acción, un paso de selección de los dados que va a mover:
    // la UI los remarca como cuando los toca el humano.
    ...plan.actions.flatMap((action): AppTurnStep[] =>
      action.kind === 'swap'
        ? [
            { kind: 'select', position: action.a },
            { kind: 'select', position: action.b },
            { kind: 'action', action },
          ]
        : [
            { kind: 'select', position: action.position },
            { kind: 'action', action },
          ]
    ),
    { kind: 'declare' },
  ];
  // La adivinanza va al final del turno, solo si al declarar acaba de revelar letra.
  const afterDeclare = moves.reduce(applyAppStep, state);
  const guess = isMatchGuessAllowed(afterDeclare)
    ? chooseAppGuess(afterDeclare, deps.wordRepository.allWords(), deps.random, level)
    : null;
  if (guess) return [...moves, { kind: 'guess', input: guess }];
  return [...moves, { kind: 'end-turn' }];
}

export function applyAppStep(state: MatchState, step: AppTurnStep): MatchState {
  switch (step.kind) {
    case 'guess':
      return guessMatchWord(state, 'p2', step.input);
    case 'select':
      return state;
    case 'action':
      return step.action.kind === 'swap'
        ? swapMatchCubes(state, step.action.a, step.action.b).state
        : rotateMatchCube(state, step.action.position, step.action.rotation);
    case 'declare':
      return declareMatchObjectives(state).state;
    case 'end-turn':
      return endMatchTurn(state);
  }
}

export function playAppTurn(
  state: MatchState,
  deps: Dependencies,
  level: AppLevel = 'master'
): { state: MatchState; steps: AppTurnStep[] } {
  const steps = buildAppTurnSteps(state, deps, level);
  return { state: steps.reduce(applyAppStep, state), steps };
}
