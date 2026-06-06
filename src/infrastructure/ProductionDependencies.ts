import { Dependencies } from '@/application/Dependencies';
import { DefaultRandom } from './Random';
import { InMemoryWordRepository } from './WordRepository';

export function buildProductionDependencies(): Dependencies {
  const random = new DefaultRandom();
  return {
    random,
    wordRepository: new InMemoryWordRepository(random),
  };
}
