import { createContext, ReactNode, useCallback, useContext, useMemo, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { music } from '@/ui/audio/music';
import { GameStartCover } from '@/ui/components/GameStartCover';

// Cada mitad del fundido (salida a negro + entrada desde negro). El total
// (≈ 2,2 s) basta para apreciarlo y las dos mitades son iguales.
const FADE_HALF_MS = 1100;

export type GameTransition = {
  // Fundido a negro a partes iguales: oscurece la pantalla actual (salida),
  // ejecuta atBlack en el punto negro (cambio de pantalla) y revela la nueva
  // (entrada). Para los modos con pantalla de preparación y al reiniciar.
  fadeThroughBlack: (atBlack: () => void) => void;
  // La pantalla nace en negro y solo se revela (entrada). Para los modos que
  // arrancan la partida directamente, sin pantalla de preparación.
  revealFromBlack: () => void;
  // Cancela el fundido y devuelve la música del menú (al salir o terminar).
  endTransition: () => void;
};

const GameTransitionContext = createContext<GameTransition | null>(null);

export function useGameTransitionContext(): GameTransition {
  const ctx = useContext(GameTransitionContext);
  if (!ctx) throw new Error('useGameTransition fuera de GameTransitionProvider');
  return ctx;
}

// El velo vive aquí, por encima de las pantallas, y nunca se desmonta cuando
// una pantalla cambia entre setup / partida / fin. Así la animación de
// revelado no se pierde al cruzar ese cambio.
export function GameTransitionProvider({ children }: { children: ReactNode }) {
  const cover = useRef(new Animated.Value(0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  const startGameMusic = useCallback(() => {
    music.setTrack('game');
    if (music.isEnabled()) music.start();
  }, []);

  const reveal = useCallback(
    (duration: number) => {
      const anim = Animated.timing(cover, {
        toValue: 0,
        duration,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      });
      animRef.current = anim;
      anim.start(({ finished }) => {
        if (finished) startGameMusic();
      });
    },
    [cover, startGameMusic]
  );

  const fadeThroughBlack = useCallback(
    (atBlack: () => void) => {
      animRef.current?.stop();
      music.pause();
      cover.setValue(0);
      const out = Animated.timing(cover, {
        toValue: 1,
        duration: FADE_HALF_MS,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      });
      animRef.current = out;
      out.start(({ finished }) => {
        if (!finished) return;
        atBlack();
        reveal(FADE_HALF_MS);
      });
    },
    [cover, reveal]
  );

  const revealFromBlack = useCallback(() => {
    animRef.current?.stop();
    music.pause();
    cover.setValue(1);
    reveal(FADE_HALF_MS * 2);
  }, [cover, reveal]);

  const endTransition = useCallback(() => {
    animRef.current?.stop();
    cover.setValue(0);
    music.setTrack('menu');
  }, [cover]);

  const value = useMemo<GameTransition>(
    () => ({ fadeThroughBlack, revealFromBlack, endTransition }),
    [fadeThroughBlack, revealFromBlack, endTransition]
  );

  return (
    <GameTransitionContext.Provider value={value}>
      {children}
      <GameStartCover opacity={cover} />
    </GameTransitionContext.Provider>
  );
}
