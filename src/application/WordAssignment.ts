import { ALL_OBJECTIVES } from '@/domain/Objective';
import { CardAssignment, FaceSign, WORD_LENGTH } from '@/domain/SecretWord';
import { Random } from '@/infrastructure/Random';

// Asigna a cada letra de la palabra un faceSign único, escogiendo 6 de los 6
// objetivos fijos. Como hay exactamente 6, el faceSign de cada carta queda
// determinado por la permutación que elija el random.
export function buildAssignments(
  letters: ReadonlyArray<string>,
  random: Random
): CardAssignment[] {
  if (letters.length !== WORD_LENGTH) {
    throw new Error(`buildAssignments expects ${WORD_LENGTH} letters`);
  }
  const signs = random.shuffle(ALL_OBJECTIVES.map(toFaceSign));
  return letters.map((letter, i) => ({ letter, faceSign: signs[i] }));
}

function toFaceSign(o: { kind: 'symbol' | 'color'; value: string }): FaceSign {
  return o.kind === 'symbol'
    ? { kind: 'symbol', value: o.value as never }
    : { kind: 'color', value: o.value as never };
}
