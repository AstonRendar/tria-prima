import { Board } from '@/domain/Board';
import { ObjectiveSlot } from '@/domain/Objective';
import { SecretWord } from '@/domain/SecretWord';

export type SoloPlayOutcome = 'won' | 'lost';

export type SoloPlayState = {
  readonly board: Board;
  readonly objectives: ReadonlyArray<ObjectiveSlot>;
  readonly secretWord: SecretWord;
  readonly turn: number;
  readonly initialFreeObjectives: number;
  readonly canDeclareThisTurn: boolean;
  readonly revealedThisTurn: boolean;
  readonly finished: boolean;
  readonly outcome: SoloPlayOutcome | null;
  readonly finalScore: number | null;
};
