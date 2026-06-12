import { Board, isLocked, rotateCubeAt, swapPositions } from '@/domain/Board';
import { RotationKind } from '@/domain/Cube';
import { findMatchedLine, Objective } from '@/domain/Objective';
import { BOARD_CELLS, Position, sameRowOrColumn } from '@/domain/Position';
import {
  MARKERS_TO_REVEAL,
  MIN_REVEALED_TO_GUESS,
  normalizeGuess,
  revealedCount,
  SecretWord,
  WORD_LENGTH,
} from '@/domain/SecretWord';
import { Random } from '@/infrastructure/Random';
import { currentOpponent, MatchState } from './MatchState';

export type AppAction =
  | { kind: 'rotate'; position: Position; rotation: RotationKind }
  | { kind: 'swap'; a: Position; b: Position };

// Nivel del maestro: el aprendiz se despista (la mitad de las veces juega una
// jugada cualquiera) y solo arriesga adivinanzas casi seguras; el maestro
// juega siempre la mejor jugada y arriesga antes.
export type AppLevel = 'apprentice' | 'master';

const APPRENTICE_BLUNDER_CHANCE = 0.5;

export type AppTurnPlan = {
  actions: ReadonlyArray<AppAction>;
  touched: Position[];
};

// Los dados tienen caras opuestas idénticas (ver CUBE_SET): voltear
// adelante/atrás y rotar ↻/↺ son equivalentes, basta explorar una de cada.
const ROTATION_KINDS: ReadonlyArray<RotationKind> = ['roll-forward', 'spin-cw'];

// Elige el turno de la app por búsqueda voraz: evalúa todos los turnos
// legales (un intercambio, o dos giros sobre dados distintos) y se queda con
// el que más objetivos declarables deja en el tablero, con bonus por los que
// revelarían una letra del rival y penalización por dejar formadas las líneas
// que el rival mantiene bloqueadas. Empata al azar para no ser predecible.
export function planAppTurn(
  state: MatchState,
  random: Random,
  level: AppLevel = 'master'
): AppTurnPlan {
  const free: Position[] = [];
  for (let p = 0; p < BOARD_CELLS; p++) {
    if (!isLocked(state.board, p)) free.push(p);
  }

  const candidates: { plan: AppTurnPlan; score: number }[] = [];

  for (let i = 0; i < free.length; i++) {
    for (let j = i + 1; j < free.length; j++) {
      const a = free[i];
      const b = free[j];
      if (sameRowOrColumn(a, b)) {
        const board = swapPositions(state.board, a, b);
        candidates.push({
          plan: { actions: [{ kind: 'swap', a, b }], touched: [a, b] },
          score: scoreBoard(board, state),
        });
      }
      for (const ka of ROTATION_KINDS) {
        const afterA = rotateCubeAt(state.board, a, ka);
        for (const kb of ROTATION_KINDS) {
          const board = rotateCubeAt(afterA, b, kb);
          candidates.push({
            plan: {
              actions: [
                { kind: 'rotate', position: a, rotation: ka },
                { kind: 'rotate', position: b, rotation: kb },
              ],
              touched: [a, b],
            },
            score: scoreBoard(board, state),
          });
        }
      }
    }
  }

  if (level === 'apprentice' && random.next() < APPRENTICE_BLUNDER_CHANCE) {
    return candidates[random.pickIndex(candidates.length)].plan;
  }

  const best = Math.max(...candidates.map((c) => c.score));
  const winners = candidates.filter((c) => c.score === best);
  return winners[random.pickIndex(winners.length)].plan;
}

// Puntúa un tablero hipotético desde el punto de vista del jugador en turno:
// +1 por objetivo que declararía (cumplido y no bloqueado por el rival),
// +1 extra si esa declaración revelaría una letra del rival. Las líneas que
// el rival mantiene bloqueadas puntúan en negativo mientras sigan formadas
// (el rival las re-declara cada turno y gana un marcador), con -1 extra si
// esa re-declaración revelaría una letra propia: romperlas vale tanto como
// declarar.
function scoreBoard(board: Board, state: MatchState): number {
  const me = state.currentPlayerId;
  const opponentWord = currentOpponent(state).secretWord;
  const myWord = state.players[me].secretWord;
  let score = 0;
  for (const slot of state.objectives) {
    if (findMatchedLine(board, slot.objective) === null) continue;
    if (slot.blockedBy !== null && slot.blockedBy !== me) {
      score -= wouldRevealLetter(myWord, slot.objective) ? 2 : 1;
    } else {
      score += wouldRevealLetter(opponentWord, slot.objective) ? 2 : 1;
    }
  }
  return score;
}

function wouldRevealLetter(word: SecretWord, objective: Objective): boolean {
  const card = word.cards.find(
    (c) => c.faceSign.kind === objective.kind && c.faceSign.value === objective.value
  );
  return card !== undefined && !card.revealed && card.markers === MARKERS_TO_REVEAL - 1;
}

// Decide si la app intenta adivinar. Juega limpio: solo usa las letras
// reveladas del rival y la lista pública de palabras.
//   - 6 letras reveladas → la palabra es conocida (ambos niveles).
//   - maestro: una única candidata → la arriesga; 5 letras y varias → una al azar.
//   - aprendiz: solo arriesga la única candidata con 5+ letras reveladas.
export function chooseAppGuess(
  state: MatchState,
  words: ReadonlyArray<string>,
  random: Random,
  level: AppLevel = 'master'
): string | null {
  const word = currentOpponent(state).secretWord;
  const revealed = revealedCount(word);
  if (revealed < MIN_REVEALED_TO_GUESS) return null;
  if (revealed === WORD_LENGTH) {
    return word.cards.map((c) => c.letter).join('');
  }
  const candidates = [...new Set(words.map(normalizeGuess))].filter((w) =>
    matchesRevealed(word, w)
  );
  if (level === 'apprentice') {
    if (candidates.length === 1 && revealed >= WORD_LENGTH - 1) return candidates[0];
    return null;
  }
  if (candidates.length === 1) return candidates[0];
  if (candidates.length > 1 && revealed >= WORD_LENGTH - 1) {
    return candidates[random.pickIndex(candidates.length)];
  }
  return null;
}

function matchesRevealed(word: SecretWord, candidate: string): boolean {
  if (candidate.length !== WORD_LENGTH) return false;
  return word.cards.every((c, i) => !c.revealed || candidate[i] === c.letter);
}
