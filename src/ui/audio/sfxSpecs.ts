import { ToneSpec } from './synth';

export type SoundKey =
  | 'cube-roll'
  | 'cube-spin'
  | 'swap'
  | 'objective'
  | 'reveal'
  | 'turn-end'
  | 'win'
  | 'lose';

// Única fuente de verdad de los efectos: la web los toca en vivo con la
// Web Audio API y el nativo los pre-renderiza a WAV con el mismo spec.
export const SFX_SPECS: Record<SoundKey, ReadonlyArray<ToneSpec>> = {
  'cube-roll': [
    { frequency: 240, start: 0, duration: 0.09, wave: 'triangle', gain: 0.12 },
  ],
  'cube-spin': [
    { frequency: 380, toFrequency: 520, start: 0, duration: 0.08, wave: 'sine', gain: 0.1 },
  ],
  swap: [
    { frequency: 180, toFrequency: 360, start: 0, duration: 0.18, wave: 'sine', gain: 0.14 },
  ],
  objective: [
    { frequency: 660, start: 0, duration: 0.14, wave: 'sine', gain: 0.16 },
    { frequency: 990, start: 0.06, duration: 0.16, wave: 'sine', gain: 0.14 },
  ],
  reveal: [
    { frequency: 880, start: 0, duration: 0.1, wave: 'sine', gain: 0.18 },
    { frequency: 1175, start: 0.08, duration: 0.1, wave: 'sine', gain: 0.18 },
    { frequency: 1760, start: 0.16, duration: 0.18, wave: 'sine', gain: 0.2 },
  ],
  'turn-end': [
    { frequency: 180, start: 0, duration: 0.1, wave: 'square', gain: 0.1 },
  ],
  win: [523, 659, 784, 1047].map((frequency, i) => ({
    frequency,
    start: i * 0.1,
    duration: 0.2,
    wave: 'sine' as const,
    gain: 0.22,
  })),
  lose: [392, 330, 247].map((frequency, i) => ({
    frequency,
    start: i * 0.15,
    duration: 0.3,
    wave: 'sawtooth' as const,
    gain: 0.16,
  })),
};

export function sfxDuration(key: SoundKey): number {
  const specs = SFX_SPECS[key];
  return Math.max(...specs.map((s) => s.start + s.duration)) + 0.1;
}
