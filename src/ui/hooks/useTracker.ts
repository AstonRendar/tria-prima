import { useCallback, useRef, useState } from 'react';
import { Dependencies } from '@/application/Dependencies';
import { markObjective, MarkResult, unmarkObjective } from '@/application/MarkObjective';
import { startTracker } from '@/application/StartTracker';
import { canGuessTracker, guessTracker } from '@/application/TrackerActions';
import { TrackerState } from '@/application/TrackerState';
import { Objective } from '@/domain/Objective';

export type TrackerApi = {
  state: TrackerState;
  mark: (objective: Objective) => MarkResult;
  unmark: (objective: Objective) => void;
  guess: (input: string) => void;
  canGuessNow: boolean;
  restart: () => void;
};

export function useTracker(deps: Dependencies): TrackerApi {
  const depsRef = useRef(deps);
  const [state, setState] = useState<TrackerState>(() => startTracker(depsRef.current));

  const mark = useCallback((objective: Objective): MarkResult => {
    const result = markObjective(state, objective);
    if (result.applied) setState(result.state);
    return result;
  }, [state]);

  const unmark = useCallback((objective: Objective) => {
    setState((s) => unmarkObjective(s, objective));
  }, []);

  const guess = useCallback((input: string) => {
    setState((s) => guessTracker(s, input));
  }, []);

  const restart = useCallback(() => {
    setState(startTracker(depsRef.current));
  }, []);

  return {
    state,
    mark,
    unmark,
    guess,
    canGuessNow: canGuessTracker(state),
    restart,
  };
}
