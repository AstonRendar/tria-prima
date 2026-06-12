import { renderWavDataUri, ToneSpec } from '../synth';

function decodeDataUri(uri: string): Uint8Array {
  const base64 = uri.replace('data:audio/wav;base64,', '');
  const binary = Buffer.from(base64, 'base64');
  return new Uint8Array(binary);
}

function ascii(bytes: Uint8Array, offset: number, length: number): string {
  return String.fromCharCode(...bytes.slice(offset, offset + length));
}

const TONE: ToneSpec = { frequency: 440, start: 0, duration: 0.1, wave: 'sine', gain: 0.5 };

describe('renderWavDataUri', () => {
  it('produces a well-formed mono 16-bit WAV data uri', () => {
    const uri = renderWavDataUri([TONE], 0.2, 8000);
    expect(uri.startsWith('data:audio/wav;base64,')).toBe(true);

    const bytes = decodeDataUri(uri);
    expect(ascii(bytes, 0, 4)).toBe('RIFF');
    expect(ascii(bytes, 8, 4)).toBe('WAVE');
    expect(ascii(bytes, 36, 4)).toBe('data');

    const view = new DataView(bytes.buffer);
    expect(view.getUint16(22, true)).toBe(1); // mono
    expect(view.getUint32(24, true)).toBe(8000); // sample rate
    expect(view.getUint16(34, true)).toBe(16); // bits por muestra
    // 0.2 s a 8 kHz = 1600 muestras de 2 bytes.
    expect(view.getUint32(40, true)).toBe(1600 * 2);
    expect(bytes.length).toBe(44 + 1600 * 2);
  });

  it('keeps silence outside the tone and signal inside it', () => {
    const uri = renderWavDataUri([{ ...TONE, start: 0.1 }], 0.3, 8000);
    const bytes = decodeDataUri(uri);
    const view = new DataView(bytes.buffer);
    const sampleAt = (seconds: number) =>
      view.getInt16(44 + Math.floor(seconds * 8000) * 2, true);

    expect(sampleAt(0.05)).toBe(0); // antes del tono
    let peak = 0;
    for (let s = 0.1; s < 0.2; s += 0.001) {
      peak = Math.max(peak, Math.abs(sampleAt(s)));
    }
    expect(peak).toBeGreaterThan(1000); // hay señal audible
    expect(peak).toBeLessThanOrEqual(32767); // sin desbordar
  });

  it('clamps overlapping tones instead of overflowing', () => {
    const loud: ToneSpec = { ...TONE, gain: 1 };
    const uri = renderWavDataUri([loud, loud, loud], 0.1, 8000);
    const bytes = decodeDataUri(uri);
    const view = new DataView(bytes.buffer);
    for (let i = 0; i < 800; i++) {
      const sample = view.getInt16(44 + i * 2, true);
      expect(sample).toBeGreaterThanOrEqual(-32768);
      expect(sample).toBeLessThanOrEqual(32767);
    }
  });
});
