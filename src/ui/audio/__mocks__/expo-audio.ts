// Mock de expo-audio para jest: el módulo nativo no existe en el entorno de
// test y su import de nivel de módulo revienta. Mapeado en el proyecto "ui"
// de jest (package.json).

export function createAudioPlayer() {
  return {
    loop: false,
    volume: 1,
    play(): void {},
    pause(): void {},
    remove(): void {},
    seekTo(): Promise<void> {
      return Promise.resolve();
    },
  };
}

export function setAudioModeAsync(): Promise<void> {
  return Promise.resolve();
}
