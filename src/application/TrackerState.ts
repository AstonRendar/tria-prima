import { Objective } from '@/domain/Objective';
import { SecretWord } from '@/domain/SecretWord';

export type TrackerOutcome = 'won' | 'lost';

export type TrackerState = {
  readonly secretWord: SecretWord;
  readonly declaredCount: ReadonlyMap<string, number>;
  readonly finished: boolean;
  readonly outcome: TrackerOutcome | null;
};

export function incrementDeclared(
  counts: ReadonlyMap<string, number>,
  objective: Objective
): Map<string, number> {
  const next = new Map(counts);
  next.set(objective.id, (next.get(objective.id) ?? 0) + 1);
  return next;
}

export function decrementDeclared(
  counts: ReadonlyMap<string, number>,
  objective: Objective
): Map<string, number> {
  const next = new Map(counts);
  const current = next.get(objective.id) ?? 0;
  if (current <= 0) return next;
  next.set(objective.id, current - 1);
  return next;
}
