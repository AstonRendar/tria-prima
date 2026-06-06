import { Random } from '@/infrastructure/Random';
import { WordRepository } from '@/infrastructure/WordRepository';

export type Dependencies = {
  readonly random: Random;
  readonly wordRepository: WordRepository;
};
