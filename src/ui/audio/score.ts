// Partitura de la música de fondo, compartida por el reproductor web (en
// vivo) y el nativo (pre-renderizado a WAV).

export const BPM = 76;
export const BEAT = 60 / BPM;
export const BARS = 8;
export const LOOP_BEATS = BARS * 4;
export const LOOP_DURATION = LOOP_BEATS * BEAT;

// Cadencia andaluza en Re menor: Dm — C — B♭ — A. Tríadas en midi (octava 3).
export const CHORDS: ReadonlyArray<readonly number[]> = [
  [50, 53, 57], // Dm
  [48, 52, 55], // C
  [46, 50, 53], // B♭
  [45, 49, 52], // A
];
export const BAR_CHORD = [0, 0, 1, 1, 2, 2, 3, 3];

// Melodía: [midi, pulso de inicio, duración en pulsos].
export const MELODY: ReadonlyArray<readonly [number, number, number]> = [
  [69, 0, 2], [74, 2, 1.5], [76, 3.5, 0.5], [77, 4, 2], [76, 6, 1], [74, 7, 1],
  [76, 8, 2], [79, 10, 1.5], [76, 11.5, 0.5], [74, 12, 3],
  [74, 16, 2], [77, 18, 1.5], [76, 19.5, 0.5], [74, 20, 2], [72, 22, 2],
  [73, 24, 2], [76, 26, 1], [74, 27, 1], [69, 28, 4],
];

export const ARP_PATTERN = [0, 1, 2, 1, 0, 1, 2, 1];

export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}
