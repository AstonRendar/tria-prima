// Partituras de la música de fondo, compartidas por el reproductor web (en
// vivo) y el nativo (pre-renderizado a WAV). Hay dos pistas: la del menú y
// la de partida, ambas sobre la misma cadencia para que suenen de la misma
// familia.

export type MusicTrack = 'menu' | 'game';

// Melodía: [midi, pulso de inicio, duración en pulsos].
export type MelodyNote = readonly [number, number, number];

export type Score = {
  readonly bpm: number;
  readonly bars: number;
  readonly chords: ReadonlyArray<readonly number[]>;
  readonly barChord: ReadonlyArray<number>;
  readonly melody: ReadonlyArray<MelodyNote>;
  readonly arpPattern: ReadonlyArray<number>;
};

export function beatOf(score: Score): number {
  return 60 / score.bpm;
}

export function loopBeatsOf(score: Score): number {
  return score.bars * 4;
}

export function loopDurationOf(score: Score): number {
  return loopBeatsOf(score) * beatOf(score);
}

// Cadencia andaluza en Re menor: Dm — C — B♭ — A. Tríadas en midi (octava 3).
const ANDALUSIAN_CHORDS: ReadonlyArray<readonly number[]> = [
  [50, 53, 57], // Dm
  [48, 52, 55], // C
  [46, 50, 53], // B♭
  [45, 49, 52], // A
];

// Tema del menú: contemplativo, frases largas.
const MENU_SCORE: Score = {
  bpm: 76,
  bars: 8,
  chords: ANDALUSIAN_CHORDS,
  barChord: [0, 0, 1, 1, 2, 2, 3, 3],
  melody: [
    [69, 0, 2], [74, 2, 1.5], [76, 3.5, 0.5], [77, 4, 2], [76, 6, 1], [74, 7, 1],
    [76, 8, 2], [79, 10, 1.5], [76, 11.5, 0.5], [74, 12, 3],
    [74, 16, 2], [77, 18, 1.5], [76, 19.5, 0.5], [74, 20, 2], [72, 22, 2],
    [73, 24, 2], [76, 26, 1], [74, 27, 1], [69, 28, 4],
  ],
  arpPattern: [0, 1, 2, 1, 0, 1, 2, 1],
};

// Tema de partida: la misma cadencia con pulso más vivo y melodía más
// inquieta, para acompañar la concentración sin repetir el tema del menú.
const GAME_SCORE: Score = {
  bpm: 88,
  bars: 8,
  chords: ANDALUSIAN_CHORDS,
  barChord: [0, 0, 1, 1, 2, 2, 3, 3],
  melody: [
    [74, 0, 1], [76, 1, 0.5], [77, 1.5, 0.5], [74, 2, 2], [69, 4, 1.5], [74, 5.5, 0.5], [76, 6, 1], [77, 7, 1],
    [79, 8, 1], [77, 9, 0.5], [76, 9.5, 0.5], [79, 10, 2], [76, 12, 1.5], [72, 13.5, 0.5], [76, 14, 2],
    [77, 16, 1], [74, 17, 0.5], [70, 17.5, 0.5], [74, 18, 2], [77, 20, 1.5], [79, 21.5, 0.5], [77, 22, 1], [76, 23, 1],
    [73, 24, 1], [76, 25, 0.5], [74, 25.5, 0.5], [73, 26, 2], [69, 28, 3], [73, 31, 1],
  ],
  arpPattern: [0, 2, 1, 2, 0, 2, 1, 2],
};

export const SCORES: Record<MusicTrack, Score> = {
  menu: MENU_SCORE,
  game: GAME_SCORE,
};

export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}
