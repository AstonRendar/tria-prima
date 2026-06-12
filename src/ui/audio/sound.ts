import { Platform } from 'react-native';
import { NativeAudioBus } from './nativeAudio';
import { readFlag, writeFlag } from './preferences';
import { SFX_SPECS, SoundKey } from './sfxSpecs';
import { ToneSpec } from './synth';

export type { SoundKey };

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
    for (const spec of SFX_SPECS[key]) {
      this.scheduleSpec(ctx, spec);
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

  private scheduleSpec(ctx: AudioContext, spec: ToneSpec): void {
    const start = ctx.currentTime + spec.start;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = spec.wave;
    osc.frequency.setValueAtTime(spec.frequency, start);
    if (spec.toFrequency !== undefined) {
      osc.frequency.linearRampToValueAtTime(spec.toFrequency, start + spec.duration);
    }
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(spec.gain, start + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, start + spec.duration);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + spec.duration + 0.05);
  }
}

export const audio: AudioBus =
  Platform.OS === 'web' ? new WebAudioBus() : new NativeAudioBus();
