import { useEffect } from 'react';
import { music } from '@/ui/audio/music';

// Coordina la música con el estado de la partida: pista de partida mientras hay
// una en curso y pista de menú al terminar la partida o salir de la pantalla.
// No hay transición visual: el cambio entre setup / partida / fin es directo,
// igual que al volver al menú (navegación normal del Stack).
export function useGameMusic(active: boolean): void {
  useEffect(() => {
    if (!active) {
      music.setTrack('menu');
      return;
    }
    music.setTrack('game');
    if (music.isEnabled()) music.start();
  }, [active]);

  useEffect(() => () => music.setTrack('menu'), []);
}
