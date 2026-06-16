import { useEffect, useRef } from 'react';
import { GameTransition, useGameTransitionContext } from '@/ui/GameTransitionProvider';

// Da acceso al fundido de entrada a la partida (gobernado por el provider, que
// mantiene el velo montado por encima de las pantallas) y se encarga de
// devolver la música del menú al terminar la partida o salir de la pantalla.
export function useGameStartTransition(active: boolean): GameTransition {
  const ctx = useGameTransitionContext();
  const wasActive = useRef(active);

  useEffect(() => {
    if (!active && wasActive.current) {
      wasActive.current = false;
      ctx.endTransition();
    } else if (active) {
      wasActive.current = true;
    }
  }, [active, ctx]);

  useEffect(() => () => ctx.endTransition(), [ctx]);

  return ctx;
}
