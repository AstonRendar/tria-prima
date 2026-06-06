import { Platform } from 'react-native';
import { readFlag, writeFlag } from './preferences';

export interface MusicPlayer {
  // Arranca la música en el primer gesto del usuario si la preferencia está activa.
  init(): void;
  start(): void;
  stop(): void;
  toggle(): boolean;
  isEnabled(): boolean;
}

const STORAGE_KEY = 'tria-prima/music-enabled';

const BPM = 76;
const BEAT = 60 / BPM;
const BARS = 8;
const LOOP_BEATS = BARS * 4;
const LOOP_DURATION = LOOP_BEATS * BEAT;

// Cadencia andaluza en Re menor: Dm — C — B♭ — A. Tríadas en midi (octava 3).
const CHORDS: ReadonlyArray<readonly number[]> = [
  [50, 53, 57], // Dm
  [48, 52, 55], // C
  [46, 50, 53], // B♭
  [45, 49, 52], // A
];
const BAR_CHORD = [0, 0, 1, 1, 2, 2, 3, 3];

// Melodía: [midi, pulso de inicio, duración en pulsos].
const MELODY: ReadonlyArray<readonly [number, number, number]> = [
  [69, 0, 2], [74, 2, 1.5], [76, 3.5, 0.5], [77, 4, 2], [76, 6, 1], [74, 7, 1],
  [76, 8, 2], [79, 10, 1.5], [76, 11.5, 0.5], [74, 12, 3],
  [74, 16, 2], [77, 18, 1.5], [76, 19.5, 0.5], [74, 20, 2], [72, 22, 2],
  [73, 24, 2], [76, 26, 1], [74, 27, 1], [69, 28, 4],
];

const ARP_PATTERN = [0, 1, 2, 1, 0, 1, 2, 1];

function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

type WebAudioCtor = new () => AudioContext;
type LegacyWindow = Window & { webkitAudioContext?: WebAudioCtor };

class WebMusicPlayer implements MusicPlayer {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private leadBus: AudioNode | null = null;
  private loopTimer: ReturnType<typeof setTimeout> | null = null;
  private playing = false;
  private enabled = readFlag(STORAGE_KEY);

  isEnabled(): boolean {
    return this.enabled;
  }

  init(): void {
    if (!this.enabled || typeof window === 'undefined') return;
    // El navegador bloquea el audio hasta un gesto del usuario.
    window.addEventListener(
      'pointerdown',
      () => {
        if (this.enabled && !this.playing) this.start();
      },
      { once: true }
    );
  }

  toggle(): boolean {
    if (this.playing) this.stop();
    else this.start();
    return this.enabled;
  }

  start(): void {
    this.enabled = true;
    writeFlag(STORAGE_KEY, true);
    if (this.playing) return;
    const ctx = this.getCtx();
    if (!ctx) return;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(1, ctx.currentTime + 2);
    master.connect(ctx.destination);

    // Eco suave para la atmósfera de laboratorio.
    const delay = ctx.createDelay(1);
    delay.delayTime.value = BEAT;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.3;
    const wet = ctx.createGain();
    wet.gain.value = 0.25;
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(wet);
    wet.connect(master);

    // La melodía pasa por un paso-bajo para suavizar la onda cuadrada (sonido 16 bits).
    const leadFilter = ctx.createBiquadFilter();
    leadFilter.type = 'lowpass';
    leadFilter.frequency.value = 1400;
    leadFilter.connect(master);
    leadFilter.connect(delay);

    this.master = master;
    this.leadBus = leadFilter;
    this.playing = true;
    this.scheduleLoop(ctx, ctx.currentTime + 0.1);
  }

  stop(): void {
    this.enabled = false;
    writeFlag(STORAGE_KEY, false);
    if (!this.playing) return;
    this.playing = false;
    if (this.loopTimer) {
      clearTimeout(this.loopTimer);
      this.loopTimer = null;
    }
    const ctx = this.ctx;
    const master = this.master;
    if (ctx && master) {
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
      setTimeout(() => master.disconnect(), 1000);
    }
    this.master = null;
    this.leadBus = null;
  }

  private scheduleLoop(ctx: AudioContext, loopStart: number): void {
    const master = this.master;
    const leadBus = this.leadBus;
    if (!this.playing || !master || !leadBus) return;

    for (let bar = 0; bar < BARS; bar++) {
      const chord = CHORDS[BAR_CHORD[bar]];
      const barStart = loopStart + bar * 4 * BEAT;

      // Bajo: fundamental en blancas.
      const root = midiToFreq(chord[0] - 12);
      this.note(ctx, master, root, barStart, 2 * BEAT, 'triangle', 0.07);
      this.note(ctx, master, root, barStart + 2 * BEAT, 2 * BEAT, 'triangle', 0.05);

      // Arpegio: corcheas suaves una octava arriba.
      ARP_PATTERN.forEach((degree, i) => {
        const freq = midiToFreq(chord[degree] + 12);
        this.note(ctx, master, freq, barStart + i * BEAT * 0.5, BEAT * 0.45, 'sine', 0.025);
      });
    }

    // Melodía: onda cuadrada filtrada, con eco.
    for (const [midi, beat, dur] of MELODY) {
      this.note(ctx, leadBus, midiToFreq(midi), loopStart + beat * BEAT, dur * BEAT, 'square', 0.045);
    }

    const msUntilNextSchedule = (loopStart + LOOP_DURATION - ctx.currentTime - 1.5) * 1000;
    this.loopTimer = setTimeout(
      () => this.scheduleLoop(ctx, loopStart + LOOP_DURATION),
      Math.max(0, msUntilNextSchedule)
    );
  }

  private note(
    ctx: AudioContext,
    out: AudioNode,
    frequency: number,
    start: number,
    duration: number,
    type: OscillatorType,
    gain: number
  ): void {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, start);
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(gain, start + 0.02);
    g.gain.setValueAtTime(gain, start + duration * 0.7);
    g.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(g);
    g.connect(out);
    osc.start(start);
    osc.stop(start + duration + 0.05);
  }

  private getCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const W = window as LegacyWindow;
      const Ctor = window.AudioContext ?? W.webkitAudioContext;
      if (!Ctor) return null;
      try {
        this.ctx = new Ctor();
      } catch {
        return null;
      }
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }
}

class SilentMusicPlayer implements MusicPlayer {
  init(): void {}
  start(): void {}
  stop(): void {}
  toggle(): boolean {
    return false;
  }
  isEnabled(): boolean {
    return false;
  }
}

export const music: MusicPlayer =
  Platform.OS === 'web' ? new WebMusicPlayer() : new SilentMusicPlayer();
