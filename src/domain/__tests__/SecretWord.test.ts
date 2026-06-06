import { Objective } from '@/domain/Objective';
import {
  addMarkerForObjective,
  buildSecretWord,
  canGuess,
  CardAssignment,
  FaceSign,
  matchesGuess,
  maskedText,
  normalizeGuess,
  plainText,
  revealedCount,
} from '@/domain/SecretWord';

const SIGNS: FaceSign[] = [
  { kind: 'symbol', value: 'sulfur' },
  { kind: 'symbol', value: 'salt' },
  { kind: 'symbol', value: 'mercury' },
  { kind: 'color', value: 'nigredo' },
  { kind: 'color', value: 'rubedo' },
  { kind: 'color', value: 'citrinitas' },
];

function buildAssignments(word: string): CardAssignment[] {
  return word.split('').map((letter, i) => ({ letter, faceSign: SIGNS[i] }));
}

const TRIANGLE_OBJ: Objective = { id: 'sym:sulfur', kind: 'symbol', value: 'sulfur' };
const RED_OBJ: Objective = { id: 'col:rubedo', kind: 'color', value: 'rubedo' };
const THETA_OBJ: Objective = { id: 'sym:mercury', kind: 'symbol', value: 'mercury' };

describe('SecretWord', () => {
  it('builds a word with 6 cards and matching faceSigns', () => {
    const word = buildSecretWord(buildAssignments('CAMINO'));
    expect(word.cards).toHaveLength(6);
    expect(word.cards.map((c) => c.letter).join('')).toBe('CAMINO');
    expect(word.cards.every((c) => !c.revealed && c.markers === 0)).toBe(true);
  });

  it('rejects assignments of the wrong length', () => {
    expect(() => buildSecretWord(buildAssignments('CAMINO').slice(0, 5))).toThrow();
  });

  it('addMarkerForObjective targets the card whose faceSign matches', () => {
    const word = buildSecretWord(buildAssignments('CAMINO'));
    const result = addMarkerForObjective(word, TRIANGLE_OBJ)!;
    expect(result.cardIndex).toBe(0);
    expect(result.revealed).toBe(false);
    expect(result.word.cards[0].markers).toBe(1);
    expect(result.word.cards[1].markers).toBe(0);
  });

  it('addMarkerForObjective reveals the letter on the second marker', () => {
    let word = buildSecretWord(buildAssignments('CAMINO'));
    word = addMarkerForObjective(word, RED_OBJ)!.word;
    const result = addMarkerForObjective(word, RED_OBJ)!;
    expect(result.revealed).toBe(true);
    expect(result.word.cards[4].revealed).toBe(true);
    expect(result.word.cards[4].markers).toBe(0);
  });

  it('addMarkerForObjective is a no-op when the matched card is already revealed', () => {
    let word = buildSecretWord(buildAssignments('CAMINO'));
    word = addMarkerForObjective(word, THETA_OBJ)!.word;
    word = addMarkerForObjective(word, THETA_OBJ)!.word;
    const result = addMarkerForObjective(word, THETA_OBJ)!;
    expect(result.revealed).toBe(false);
    expect(result.word).toBe(word);
  });

  it('canGuess requires at least 4 revealed letters', () => {
    let word = buildSecretWord(buildAssignments('CAMINO'));
    expect(canGuess(word)).toBe(false);
    for (const obj of [TRIANGLE_OBJ, RED_OBJ, THETA_OBJ]) {
      word = addMarkerForObjective(word, obj)!.word;
      word = addMarkerForObjective(word, obj)!.word;
    }
    expect(revealedCount(word)).toBe(3);
    expect(canGuess(word)).toBe(false);
    const xiObj: Objective = { id: 'sym:salt', kind: 'symbol', value: 'salt' };
    word = addMarkerForObjective(word, xiObj)!.word;
    word = addMarkerForObjective(word, xiObj)!.word;
    expect(canGuess(word)).toBe(true);
  });

  it('maskedText shows revealed letters and underscores', () => {
    let word = buildSecretWord(buildAssignments('CAMINO'));
    word = addMarkerForObjective(word, TRIANGLE_OBJ)!.word;
    word = addMarkerForObjective(word, TRIANGLE_OBJ)!.word;
    expect(maskedText(word)).toBe('C _ _ _ _ _');
  });

  it('plainText returns the full word', () => {
    const word = buildSecretWord(buildAssignments('CAMINO'));
    expect(plainText(word)).toBe('CAMINO');
  });

  describe('normalizeGuess', () => {
    it('uppercases and strips accents and punctuation', () => {
      expect(normalizeGuess('  ca-míno! ')).toBe('CAMINO');
    });
  });

  it('matchesGuess accepts accented input case-insensitively', () => {
    const word = buildSecretWord(buildAssignments('CAMINO'));
    expect(matchesGuess(word, 'camíno')).toBe(true);
    expect(matchesGuess(word, 'OTRO')).toBe(false);
  });
});
