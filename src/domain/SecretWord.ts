import { CubeColor } from './Color';
import { Objective } from './Objective';
import { CubeSymbol } from './Symbol';

export const WORD_LENGTH = 6;
export const MARKERS_TO_REVEAL = 2;
export const MIN_REVEALED_TO_GUESS = 4;

export type FaceSign =
  | { readonly kind: 'symbol'; readonly value: CubeSymbol }
  | { readonly kind: 'color'; readonly value: CubeColor };

export type PlayerCard = {
  readonly letter: string;
  readonly faceSign: FaceSign;
  readonly markers: number;
  readonly revealed: boolean;
};

export type SecretWord = {
  readonly cards: ReadonlyArray<PlayerCard>;
};

export type CardAssignment = {
  readonly letter: string;
  readonly faceSign: FaceSign;
};

export function buildSecretWord(assignments: ReadonlyArray<CardAssignment>): SecretWord {
  if (assignments.length !== WORD_LENGTH) {
    throw new Error(`SecretWord must have ${WORD_LENGTH} cards, got ${assignments.length}`);
  }
  return {
    cards: assignments.map((a) => ({
      letter: a.letter,
      faceSign: a.faceSign,
      markers: 0,
      revealed: false,
    })),
  };
}

function findCardIndexForObjective(
  word: SecretWord,
  objective: Objective
): number {
  return word.cards.findIndex((c) => sameSign(c.faceSign, objective));
}

function sameSign(sign: FaceSign, objective: Objective): boolean {
  if (sign.kind !== objective.kind) return false;
  return sign.value === objective.value;
}

export type MarkerResult = {
  word: SecretWord;
  cardIndex: number;
  revealed: boolean;
};

export function addMarkerForObjective(
  word: SecretWord,
  objective: Objective
): MarkerResult | null {
  const index = findCardIndexForObjective(word, objective);
  if (index < 0) return null;
  const card = word.cards[index];
  if (card.revealed) {
    return { word, cardIndex: index, revealed: false };
  }
  const newMarkers = card.markers + 1;
  const shouldReveal = newMarkers >= MARKERS_TO_REVEAL;
  const updatedCard: PlayerCard = {
    ...card,
    markers: shouldReveal ? 0 : newMarkers,
    revealed: shouldReveal,
  };
  const cards = word.cards.slice();
  cards[index] = updatedCard;
  return { word: { cards }, cardIndex: index, revealed: shouldReveal };
}

export function revealedCount(word: SecretWord): number {
  return word.cards.filter((c) => c.revealed).length;
}

export function canGuess(word: SecretWord): boolean {
  return revealedCount(word) >= MIN_REVEALED_TO_GUESS;
}

export function maskedText(word: SecretWord): string {
  return word.cards.map((c) => (c.revealed ? c.letter : '_')).join(' ');
}

export function plainText(word: SecretWord): string {
  return word.cards.map((c) => c.letter).join('');
}

// Pasa a mayúsculas sin tildes (conservando la Ñ, también si llega descompuesta
// como N + tilde combinante).
function toPlainLetters(input: string): string {
  return input
    .normalize('NFC')
    .toUpperCase()
    .replace(/[ÁÀÄÂÃ]/g, 'A')
    .replace(/[ÉÈËÊ]/g, 'E')
    .replace(/[ÍÌÏÎ]/g, 'I')
    .replace(/[ÓÒÖÔÕ]/g, 'O')
    .replace(/[ÚÙÜÛ]/g, 'U')
    .replace(/Ç/g, 'C');
}

export function normalizeGuess(input: string): string {
  return toPlainLetters(input).replace(/[^A-ZÑ]/g, '');
}

// Una palabra clave son exactamente 6 letras: se ignoran los espacios, pero
// cualquier otro carácter (dígitos, signos) la invalida.
export function isValidSecretWord(input: string): boolean {
  const letters = toPlainLetters(input).replace(/\s/g, '');
  return letters.length === WORD_LENGTH && /^[A-ZÑ]+$/.test(letters);
}

export function matchesGuess(word: SecretWord, guess: string): boolean {
  return normalizeGuess(guess) === plainText(word);
}
