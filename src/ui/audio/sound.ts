import { Platform } from 'react-native';
import { readFlag, writeFlag } from './preferences';

export type SoundKey =
  | 'cube-roll'
  | 'cube-spin'
  | 'swap'
  | 'objective'
  | 'reveal'
  | 'turn-end'
  | 'win'
  | 'lose';

export interface AudioBus {
  play(key: SoundKey): void;
  setEnabled(enabled: boolean): void;
  isEnabled(): boolean;
}

type WebAudioCtor = new () => AudioContext;
type LegacyWindow = Window & { webkitAudioContext?: WebAudioCtor };

const STORAGE_KEY = 'tria-prima/sfx-enabled';

class WebAudioBus implements AudioBus {
  private ctx: AudioContext | null = null;
  private enabled = readFlag(STORAGE_KEY);

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    writeFlag(STORAGE_KEY, enabled);
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  play(key: SoundKey): void {
    const ctx = this.getCtx();
    if (!ctx) return;

    switch (key) {
      case 'cube-roll':
        this.tone(ctx, 240, 0.09, 'triangle', 0.12);
        return;
      case 'cube-spin':
        this.sweep(ctx, 380, 520, 0.08, 0.10);
        return;
      case 'swap':
        this.sweep(ctx, 180, 360, 0.18, 0.14);
        return;
      case 'objective':
        // Acorde alegre breve: dos tonos.
        this.tone(ctx, 660, 0.14, 'sine', 0.16);
        this.scheduleTone(ctx, 990, 0.16, 'sine', 0.14, 0.06);
        return;
      case 'reveal':
        // Tres tonos ascendentes — descubrimiento.
        this.tone(ctx, 880, 0.10, 'sine', 0.18);
        this.scheduleTone(ctx, 1175, 0.10, 'sine', 0.18, 0.08);
        this.scheduleTone(ctx, 1760, 0.18, 'sine', 0.20, 0.16);
        return;
      case 'turn-end':
        this.tone(ctx, 180, 0.10, 'square', 0.10);
        return;
      case 'win':
        [523, 659, 784, 1047].forEach((f, i) => {
          this.scheduleTone(ctx, f, 0.20, 'sine', 0.22, i * 0.10);
        });
        return;
      case 'lose':
        [392, 330, 247].forEach((f, i) => {
          this.scheduleTone(ctx, f, 0.30, 'sawtooth', 0.16, i * 0.15);
        });
        return;
    }
  }

  private getCtx(): AudioContext | null {
    if (!this.enabled) return null;
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
    // Muchos navegadores requieren un gesto del usuario para arrancar el ctx.
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private tone(
    ctx: AudioContext,
    frequency: number,
    duration: number,
    type: OscillatorType,
    gain: number
  ): void {
    this.scheduleTone(ctx, frequency, duration, type, gain, 0);
  }

  private scheduleTone(
    ctx: AudioContext,
    frequency: number,
    duration: number,
    type: OscillatorType,
    gain: number,
    delay: number
  ): void {
    const start = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, start);
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(gain, start + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.05);
  }

  private sweep(
    ctx: AudioContext,
    from: number,
    to: number,
    duration: number,
    gain: number
  ): void {
    const start = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(from, start);
    osc.frequency.linearRampToValueAtTime(to, start + duration);
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(gain, start + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.05);
  }
}

class SilentAudioBus implements AudioBus {
  private enabled = false;
  play(): void {}
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
  isEnabled(): boolean {
    return this.enabled;
  }
}

export const audio: AudioBus =
  Platform.OS === 'web' ? new WebAudioBus() : new SilentAudioBus();
