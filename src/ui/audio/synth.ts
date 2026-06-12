// Sintetizador offline: convierte listas de tonos en un WAV (PCM 16 bits,
// mono) codificado como data URI. Es la versión pre-renderizada de lo que la
// web toca en vivo con la Web Audio API; en nativo expo-audio reproduce el
// resultado.

export type Wave = 'sine' | 'square' | 'triangle' | 'sawtooth';

export type ToneSpec = {
  readonly frequency: number;
  // Si se indica, la frecuencia barre linealmente hasta este valor.
  readonly toFrequency?: number;
  readonly start: number;
  readonly duration: number;
  readonly wave: Wave;
  readonly gain: number;
};

const DEFAULT_SAMPLE_RATE = 22050;
const ATTACK = 0.015;
const DECAY_FLOOR = 0.002;

export function renderWavDataUri(
  tones: ReadonlyArray<ToneSpec>,
  totalDuration: number,
  sampleRate: number = DEFAULT_SAMPLE_RATE
): string {
  const sampleCount = Math.ceil(totalDuration * sampleRate);
  const buffer = new Float32Array(sampleCount);

  for (const tone of tones) {
    mixTone(buffer, tone, sampleRate);
  }

  return 'data:audio/wav;base64,' + encodeBase64(encodeWav(buffer, sampleRate));
}

function mixTone(buffer: Float32Array, tone: ToneSpec, sampleRate: number): void {
  const from = Math.floor(tone.start * sampleRate);
  const length = Math.floor(tone.duration * sampleRate);
  const sweep = (tone.toFrequency ?? tone.frequency) - tone.frequency;

  for (let i = 0; i < length; i++) {
    const index = from + i;
    if (index < 0 || index >= buffer.length) continue;
    const t = i / sampleRate;
    // Barrido lineal: la fase es la integral de la frecuencia instantánea.
    const phase = tone.frequency * t + (sweep * t * t) / (2 * tone.duration);
    buffer[index] += oscillate(tone.wave, phase) * envelope(t, tone.duration) * tone.gain;
  }
}

function oscillate(wave: Wave, phase: number): number {
  const cycle = phase - Math.floor(phase);
  switch (wave) {
    case 'sine':
      return Math.sin(2 * Math.PI * cycle);
    case 'square':
      return cycle < 0.5 ? 1 : -1;
    case 'triangle':
      return 4 * Math.abs(cycle - 0.5) - 1;
    case 'sawtooth':
      return 2 * cycle - 1;
  }
}

// Ataque lineal corto y caída exponencial, como las rampas de la versión web.
function envelope(t: number, duration: number): number {
  const attack = Math.min(ATTACK, duration / 4);
  if (t < attack) return t / attack;
  const progress = (t - attack) / (duration - attack);
  return Math.pow(DECAY_FLOOR, progress);
}

function encodeWav(samples: Float32Array, sampleRate: number): Uint8Array {
  const dataSize = samples.length * 2;
  const bytes = new Uint8Array(44 + dataSize);
  const view = new DataView(bytes.buffer);

  writeAscii(bytes, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeAscii(bytes, 8, 'WAVE');
  writeAscii(bytes, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeAscii(bytes, 36, 'data');
  view.setUint32(40, dataSize, true);

  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(44 + i * 2, Math.round(clamped * 32767), true);
  }
  return bytes;
}

function writeAscii(target: Uint8Array, offset: number, text: string): void {
  for (let i = 0; i < text.length; i++) {
    target[offset + i] = text.charCodeAt(i);
  }
}

const BASE64_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function encodeBase64(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i];
    const b = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const c = i + 2 < bytes.length ? bytes[i + 2] : 0;
    out += BASE64_ALPHABET[a >> 2];
    out += BASE64_ALPHABET[((a & 0x03) << 4) | (b >> 4)];
    out += i + 1 < bytes.length ? BASE64_ALPHABET[((b & 0x0f) << 2) | (c >> 6)] : '=';
    out += i + 2 < bytes.length ? BASE64_ALPHABET[c & 0x3f] : '=';
  }
  return out;
}
