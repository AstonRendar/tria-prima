import { useCallback, useRef, useState } from 'react';
import { Dependencies } from '@/application/Dependencies';
import {
  declareSoloObjectives,
  DeclareSoloResult,
} from '@/application/DeclareSoloObjectives';
import { endSoloTurn } from '@/application/EndSoloTurn';
import { guessSoloWord, isSoloGuessAllowed } from '@/application/GuessSoloWord';
import { rotateSoloCube } from '@/application/RotateSoloCube';
import { SoloPlayState } from '@/application/SoloPlayState';
import { startSoloPlay } from '@/application/StartSoloPlay';
import { swapSoloCubes } from '@/application/SwapSoloCubes';
import { RotationKind } from '@/domain/Cube';
import { Position } from '@/domain/Position';

export type SoloPlayApi = {
  state: SoloPlayState;
  rotate: (position: Position, kind: RotationKind) => void;
  swap: (a: Position, b: Position) => boolean;
  declare: () => DeclareSoloResult;
  finishTurn: (touched: ReadonlyArray<Position>) => void;
  guess: (input: string) => void;
  canGuessNow: boolean;
  restart: () => void;
};

export function useSoloPlay(deps: Dependencies): SoloPlayApi {
  const depsRef = useRef(deps);
  const [state, setState] = useState<SoloPlayState>(() => startSoloPlay(depsRef.current));

  const rotate = useCallback((position: Position, kind: RotationKind) => {
    setState((s) => rotateSoloCube(s, position, kind));
  }, []);

  const swap = useCallback(
    (a: Position, b: Position): boolean => {
      const result = swapSoloCubes(state, a, b);
      if (result.applied) setState(result.state);
      return result.applied;
    },
    [state]
  );

  const declare = useCallback((): DeclareSoloResult => {
    const result = declareSoloObjectives(state);
    if (result.state !== state) setState(result.state);
    return result;
  }, [state]);

  const finishTurn = useCallback((touched: ReadonlyArray<Position>) => {
    setState((s) => endSoloTurn(s, touched));
  }, []);

  const guess = useCallback((input: string) => {
    setState((s) => guessSoloWord(s, input));
  }, []);

  const restart = useCallback(() => {
    setState(startSoloPlay(depsRef.current));
  }, []);

  return {
    state,
    rotate,
    swap,
    declare,
    finishTurn,
    guess,
    canGuessNow: isSoloGuessAllowed(state),
    restart,
  };
}
