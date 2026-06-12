import { Position } from '@/domain/Position';
import { AppAction, AppLevel, chooseAppGuess, planAppTurn } from './AppOpponent';
import { declareMatchObjectives } from './DeclareMatchObjectives';
import { Dependencies } from './Dependencies';
import { endMatchTurn } from './EndMatchTurn';
import { guessMatchWord } from './GuessMatchWord';
import { MatchState } from './MatchState';
import { rotateMatchCube } from './RotateMatchCube';
import { swapMatchCubes } from './SwapMatchCubes';

export type AppTurnStep =
  | { kind: 'guess'; input: string }
  | { kind: 'select'; position: Position }
  | { kind: 'action'; action: AppAction }
  | { kind: 'declare' }
  | { kind: 'end-turn'; touched: Position[] };

// Construye el turno completo de la app como una lista de pasos. La UI los
// reproduce uno a uno (con retardo para que se vea la jugada) aplicando
// applyAppStep; los tests pueden plegarlos de una vez.
export function buildAppTurnSteps(
  state: MatchState,
  deps: Dependencies,
  level: AppLevel = 'master'
): AppTurnStep[] {
  if (state.finished || state.currentPlayerId !== 'p2') return [];
  const guess = chooseAppGuess(state, deps.wordRepository.allWords(), deps.random, level);
  if (guess) return [{ kind: 'guess', input: guess }];
  const plan = planAppTurn(state, deps.random, level);
  return [
    // Antes de cada acción, un paso de selección del dado que va a mover:
    // la UI lo remarca como cuando lo toca el humano.
    ...plan.actions.flatMap((action): AppTurnStep[] => [
      {
        kind: 'select',
        position: action.kind === 'swap' ? action.a : action.position,
      },
      { kind: 'action', action },
    ]),
    { kind: 'declare' },
    { kind: 'end-turn', touched: plan.touched },
  ];
}

export function applyAppStep(state: MatchState, step: AppTurnStep): MatchState {
  switch (step.kind) {
    case 'guess':
      return guessMatchWord(state, step.input);
    case 'select':
      return state;
    case 'action':
      return step.action.kind === 'swap'
        ? swapMatchCubes(state, step.action.a, step.action.b).state
        : rotateMatchCube(state, step.action.position, step.action.rotation);
    case 'declare':
      return declareMatchObjectives(state).state;
    case 'end-turn':
      return endMatchTurn(state, step.touched);
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
