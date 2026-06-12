import { useEffect } from 'react';
import { music } from '@/ui/audio/music';

// Mientras hay partida activa suena la pista de partida; al terminar o salir
// de la pantalla se vuelve a la del menú.
export function useGameMusic(active: boolean): void {
  useEffect(() => {
    music.setTrack(active ? 'game' : 'menu');
    return () => music.setTrack('menu');
  }, [active]);
}
