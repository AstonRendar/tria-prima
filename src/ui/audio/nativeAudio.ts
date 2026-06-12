import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { readFlag, writeFlag } from './preferences';
import { ARP_PATTERN, BAR_CHORD, BARS, BEAT, CHORDS, LOOP_DURATION, MELODY, midiToFreq } from './score';
import { sfxDuration, SFX_SPECS, SoundKey } from './sfxSpecs';
import { renderWavDataUri, ToneSpec } from './synth';

// Audio en iOS/Android: los mismos specs que la web, pre-renderizados a WAV
// (data URI) y reproducidos con expo-audio. Todo es perezoso: nada toca el
// módulo nativo hasta el primer play/start.

const SFX_STORAGE_KEY = 'tria-prima/sfx-enabled';
const MUSIC_STORAGE_KEY = 'tria-prima/music-enabled';

let audioModeReady = false;
function ensureAudioMode(): void {
  if (audioModeReady) return;
  audioModeReady = true;
  void setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
}

export class NativeAudioBus {
  private enabled = readFlag(SFX_STORAGE_KEY);
  private players = new Map<SoundKey, AudioPlayer>();

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    writeFlag(SFX_STORAGE_KEY, enabled);
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  play(key: SoundKey): void {
    if (!this.enabled) return;
    try {
      ensureAudioMode();
      const player = this.playerFor(key);
      void player.seekTo(0).catch(() => {});
      player.play();
    } catch {
      // Sin módulo nativo disponible (p. ej. tests): el efecto se omite.
    }
  }

  private playerFor(key: SoundKey): AudioPlayer {
    let player = this.players.get(key);
    if (!player) {
      const uri = renderWavDataUri(SFX_SPECS[key], sfxDuration(key));
      player = createAudioPlayer({ uri });
      this.players.set(key, player);
    }
    return player;
  }
}

export class NativeMusicPlayer {
  private enabled = readFlag(MUSIC_STORAGE_KEY);
  private player: AudioPlayer | null = null;
  private playing = false;

  isEnabled(): boolean {
    return this.enabled;
  }

  // En nativo no hay política de autoplay: si la preferencia está activa,
  // la música arranca con la app.
  init(): void {
    if (this.enabled) this.start();
  }

  toggle(): boolean {
    if (this.playing) this.stop();
    else this.start();
    return this.enabled;
  }

  start(): void {
    this.enabled = true;
    writeFlag(MUSIC_STORAGE_KEY, true);
    if (this.playing) return;
    try {
      ensureAudioMode();
      if (!this.player) {
        this.player = createAudioPlayer({ uri: renderLoopWav() });
        this.player.loop = true;
      }
      void this.player.seekTo(0).catch(() => {});
      this.player.play();
      this.playing = true;
    } catch {
      // Sin módulo nativo disponible: queda en silencio.
    }
  }

  stop(): void {
    this.enabled = false;
    writeFlag(MUSIC_STORAGE_KEY, false);
    if (!this.playing) return;
    this.playing = false;
    try {
      this.player?.pause();
    } catch {
      // Nada que parar.
    }
  }
}

// Renderiza el loop completo (8 compases). La melodía usa triángulo en lugar
// de la cuadrada filtrada de la web, y el eco se hornea como una repetición
// atenuada un pulso después.
function renderLoopWav(): string {
  const tones: ToneSpec[] = [];

  for (let bar = 0; bar < BARS; bar++) {
    const chord = CHORDS[BAR_CHORD[bar]];
    const barStart = bar * 4 * BEAT;

    const root = midiToFreq(chord[0] - 12);
    tones.push(note(root, barStart, 2 * BEAT, 'triangle', 0.07));
    tones.push(note(root, barStart + 2 * BEAT, 2 * BEAT, 'triangle', 0.05));

    ARP_PATTERN.forEach((degree, i) => {
      const freq = midiToFreq(chord[degree] + 12);
      tones.push(note(freq, barStart + i * BEAT * 0.5, BEAT * 0.45, 'sine', 0.025));
    });
  }

  for (const [midi, beat, dur] of MELODY) {
    const freq = midiToFreq(midi);
    const start = beat * BEAT;
    tones.push(note(freq, start, dur * BEAT, 'triangle', 0.06));
    const echoStart = start + BEAT;
    if (echoStart + dur * BEAT < LOOP_DURATION) {
      tones.push(note(freq, echoStart, dur * BEAT, 'triangle', 0.018));
    }
  }

  return renderWavDataUri(tones, LOOP_DURATION);
}

function note(
  frequency: number,
  start: number,
  duration: number,
  wave: ToneSpec['wave'],
  gain: number
): ToneSpec {
  return { frequency, start, duration, wave, gain };
}
