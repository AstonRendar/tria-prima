import { buildSecretWord, WORD_LENGTH } from '@/domain/SecretWord';
import { Dependencies } from './Dependencies';
import { TrackerState } from './TrackerState';
import { buildAssignments } from './WordAssignment';

export function startTracker(deps: Dependencies): TrackerState {
  const word = deps.wordRepository.randomWord();
  if (word.length !== WORD_LENGTH) {
    throw new Error(`WordRepository must yield ${WORD_LENGTH}-letter words, got "${word}"`);
  }
  const assignments = buildAssignments(word.split(''), deps.random);
  return {
    secretWord: buildSecretWord(assignments),
    declaredCount: new Map(),
    finished: false,
    outcome: null,
  };
}
