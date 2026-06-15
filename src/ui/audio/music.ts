import { Platform } from 'react-native';
import { NativeMusicPlayer } from './nativeAudio';
import { readFlag, writeFlag } from './preferences';
import { beatOf, loopDurationOf, midiToFreq, MusicTrack, Score, SCORES } from './score';

export interface MusicPlayer {
  // Arranca la música en el primer gesto del usuario si la preferencia está activa.
  init(): void;
  start(): void;
  stop(): void;
  toggle(): boolean;
  isEnabled(): boolean;
  // Detiene la reproducción sin tocar la preferencia (para los fundidos).
  pause(): void;
  // Cambia de pista (menú / partida) respetando la preferencia de encendido.
  setTrack(track: MusicTrack): void;
}

const STORAGE_KEY = 'tria-prima/music-enabled';

type WebAudioCtor = new () => AudioContext;
type LegacyWindow = Window & { webkitAudioContext?: WebAudioCtor };

class WebMusicPlayer implements MusicPlayer {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private leadBus: AudioNode | null = null;
  private loopTimer: ReturnType<typeof setTimeout> | null = null;
  private playing = false;
  private track: MusicTrack = 'menu';
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

  setTrack(track: MusicTrack): void {
    if (this.track === track) return;
    this.track = track;
    if (!this.playing) return;
    this.halt();
    this.begin();
  }

  start(): void {
    this.enabled = true;
    writeFlag(STORAGE_KEY, true);
    if (this.playing) return;
    this.begin();
  }

  stop(): void {
    this.enabled = false;
    writeFlag(STORAGE_KEY, false);
    this.halt();
  }

  pause(): void {
    this.halt();
  }

  private begin(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    const score = SCORES[this.track];

    const master = ctx.createGain();
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(1, ctx.currentTime + 2);
    master.connect(ctx.destination);

    // Eco suave para la atmósfera de laboratorio.
    const delay = ctx.createDelay(1);
    delay.delayTime.value = beatOf(score);
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
    this.scheduleLoop(ctx, score, ctx.currentTime + 0.1);
  }

  private halt(): void {
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

  private scheduleLoop(ctx: AudioContext, score: Score, loopStart: number): void {
    const master = this.master;
    const leadBus = this.leadBus;
    if (!this.playing || !master || !leadBus) return;
    const beat = beatOf(score);

    for (let bar = 0; bar < score.bars; bar++) {
      const chord = score.chords[score.barChord[bar]];
      const barStart = loopStart + bar * 4 * beat;

      // Bajo: fundamental en blancas.
      const root = midiToFreq(chord[0] - 12);
      this.note(ctx, master, root, barStart, 2 * beat, 'triangle', 0.07);
      this.note(ctx, master, root, barStart + 2 * beat, 2 * beat, 'triangle', 0.05);

      // Arpegio: corcheas suaves una octava arriba.
      score.arpPattern.forEach((degree, i) => {
        const freq = midiToFreq(chord[degree] + 12);
        this.note(ctx, master, freq, barStart + i * beat * 0.5, beat * 0.45, 'sine', 0.025);
      });
    }

    // Melodía: onda cuadrada filtrada, con eco.
    for (const [midi, beatStart, dur] of score.melody) {
      this.note(ctx, leadBus, midiToFreq(midi), loopStart + beatStart * beat, dur * beat, 'square', 0.045);
    }

    const loopDuration = loopDurationOf(score);
    const msUntilNextSchedule = (loopStart + loopDuration - ctx.currentTime - 1.5) * 1000;
    this.loopTimer = setTimeout(
      () => this.scheduleLoop(ctx, score, loopStart + loopDuration),
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

export const music: MusicPlayer =
  Platform.OS === 'web' ? new WebMusicPlayer() : new NativeMusicPlayer();
