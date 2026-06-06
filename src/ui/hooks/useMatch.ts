import { useCallback, useRef, useState } from 'react';
import { Dependencies } from '@/application/Dependencies';
import {
  declareMatchObjectives,
  DeclareMatchResult,
} from '@/application/DeclareMatchObjectives';
import { endMatchTurn } from '@/application/EndMatchTurn';
import { guessMatchWord, isMatchGuessAllowed } from '@/application/GuessMatchWord';
import { MatchState } from '@/application/MatchState';
import { rotateMatchCube } from '@/application/RotateMatchCube';
import { MatchSetup, startMatch } from '@/application/StartMatch';
import { swapMatchCubes } from '@/application/SwapMatchCubes';
import { RotationKind } from '@/domain/Cube';
import { Position } from '@/domain/Position';

export type MatchApi = {
  state: MatchState | null;
  start: (setup: MatchSetup) => void;
  rotate: (position: Position, kind: RotationKind) => void;
  swap: (a: Position, b: Position) => boolean;
  declare: () => DeclareMatchResult;
  finishTurn: (touched: ReadonlyArray<Position>) => void;
  guess: (input: string) => void;
  canGuessNow: boolean;
  restart: () => void;
};

export function useMatch(deps: Dependencies): MatchApi {
  const depsRef = useRef(deps);
  const setupRef = useRef<MatchSetup | null>(null);
  const [state, setState] = useState<MatchState | null>(null);

  const start = useCallback((setup: MatchSetup) => {
    setupRef.current = setup;
    setState(startMatch(depsRef.current, setup));
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
    setState(startMatch(depsRef.current, setupRef.current));
  }, []);

  return {
    state,
    start,
    rotate,
    swap,
    declare,
    finishTurn,
    guess,
    canGuessNow: state ? isMatchGuessAllowed(state) : false,
    restart,
  };
}
