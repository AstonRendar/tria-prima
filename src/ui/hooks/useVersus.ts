import { useCallback, useEffect, useRef, useState } from 'react';
import { Dependencies } from '@/application/Dependencies';
import {
  declareMatchObjectives,
  DeclareMatchResult,
} from '@/application/DeclareMatchObjectives';
import { endMatchTurn } from '@/application/EndMatchTurn';
import { guessMatchWord, isMatchGuessAllowed } from '@/application/GuessMatchWord';
import { MatchState } from '@/application/MatchState';
import { applyAppStep, AppTurnStep, buildAppTurnSteps } from '@/application/PlayAppTurn';
import { rotateMatchCube } from '@/application/RotateMatchCube';
import { startVersusMatch, VersusSetup } from '@/application/StartVersus';
import { swapMatchCubes } from '@/application/SwapMatchCubes';
import { RotationKind } from '@/domain/Cube';
import { Position } from '@/domain/Position';

const APP_STEP_DELAY_MS = 900;

export type VersusApi = {
  state: MatchState | null;
  appPlaying: boolean;
  lastAppStep: AppTurnStep | null;
  start: (setup: VersusSetup) => void;
  rotate: (position: Position, kind: RotationKind) => void;
  swap: (a: Position, b: Position) => boolean;
  declare: () => DeclareMatchResult;
  finishTurn: (touched: ReadonlyArray<Position>) => void;
  guess: (input: string) => void;
  canGuessNow: boolean;
  restart: () => void;
};

// Igual que useMatch, pero cuando el turno pasa a p2 la app juega sola:
// construye sus pasos una vez y los aplica con retardo para que la jugada
// se vea en pantalla.
export function useVersus(deps: Dependencies): VersusApi {
  const depsRef = useRef(deps);
  const setupRef = useRef<VersusSetup | null>(null);
  const [state, setState] = useState<MatchState | null>(null);
  const [appPlaying, setAppPlaying] = useState(false);
  const [lastAppStep, setLastAppStep] = useState<AppTurnStep | null>(null);
  const appRunningRef = useRef(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  useEffect(() => {
    if (!state || state.finished || state.currentPlayerId !== 'p2') {
      appRunningRef.current = false;
      setAppPlaying(false);
      return;
    }
    if (appRunningRef.current) return;
    appRunningRef.current = true;
    setAppPlaying(true);
    const steps = buildAppTurnSteps(state, depsRef.current);
    steps.forEach((step, i) => {
      timersRef.current.push(
        setTimeout(() => {
          setLastAppStep(step);
          setState((s) => (s ? applyAppStep(s, step) : s));
        }, APP_STEP_DELAY_MS * (i + 1))
      );
    });
  }, [state]);

  const start = useCallback((setup: VersusSetup) => {
    setupRef.current = setup;
    setLastAppStep(null);
    setState(startVersusMatch(depsRef.current, setup));
  }, []);

  const rotate = useCallback((position: Position, kind: RotationKind) => {
    setState((s) => (s ? rotateMatchCube(s, position, kind) : s));
  }, []);

  const swap = useCallback(
    (a: Position, b: Position): boolean => {
      if (!state) return false;
      const result = swapMatchCubes(state, a, b);
      if (result.applied) setState(result.state);
      return result.applied;
    },
    [state]
  );

  const declare = useCallback((): DeclareMatchResult => {
    if (!state) {
      return { state: state as never, declared: 0, released: 0, revealedCardIndices: [] };
    }
    const result = declareMatchObjectives(state);
    if (result.state !== state) setState(result.state);
    return result;
  }, [state]);

  const finishTurn = useCallback((touched: ReadonlyArray<Position>) => {
    setState((s) => (s ? endMatchTurn(s, touched) : s));
  }, []);

  const guess = useCallback((input: string) => {
    setState((s) => (s ? guessMatchWord(s, input) : s));
  }, []);

  const restart = useCallback(() => {
    if (!setupRef.current) return;
    clearTimers();
    appRunningRef.current = false;
    setLastAppStep(null);
    setState(startVersusMatch(depsRef.current, setupRef.current));
  }, [clearTimers]);

  return {
    state,
    appPlaying,
    lastAppStep,
    start,
    rotate,
    swap,
    declare,
    finishTurn,
    guess,
    canGuessNow: state ? isMatchGuessAllowed(state) && state.currentPlayerId === 'p1' : false,
    restart,
  };
}
