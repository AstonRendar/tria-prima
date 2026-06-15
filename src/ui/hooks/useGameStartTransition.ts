import { useCallback, useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { music } from '@/ui/audio/music';

// Cada mitad del fundido (salida a negro + entrada desde negro). El total
// (≈ 2,2 s) es suficiente para apreciarlo y las dos mitades son iguales.
const FADE_HALF_MS = 1100;

export type GameStartTransition = {
  cover: Animated.Value;
  // Fundido a negro a partes iguales: oscurece la pantalla actual (salida),
  // ejecuta atBlack en el punto negro (cambio de pantalla) y revela la nueva
  // (entrada). Para los modos con pantalla de preparación.
  fadeThroughBlack: (atBlack: () => void) => void;
  // La pantalla nace en negro y solo se revela (entrada). Para los modos que
  // arrancan la partida directamente, sin pantalla de preparación.
  revealFromBlack: () => void;
};

// Gestiona el fundido de entrada a la partida y la música: el menú se apaga
// antes del fundido, este transcurre en silencio y la pista de partida arranca
// al terminar. Al acabar la partida o salir de la pantalla, vuelve la del menú.
export function useGameStartTransition(active: boolean): GameStartTransition {
  const cover = useRef(new Animated.Value(0)).current;
  const wasActive = useRef(active);
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
        // Driver JS: la entrada cruza el remontaje del velo (setup → partida),
        // y una animación nativa quedaría enganchada al nodo desmontado.
        useNativeDriver: false,
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
        useNativeDriver: false,
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

  // Al terminar la partida o salir de la pantalla, vuelve la música del menú.
  useEffect(() => {
    if (!active && wasActive.current) {
      wasActive.current = false;
      music.setTrack('menu');
    } else if (active) {
      wasActive.current = true;
    }
  }, [active]);

  useEffect(
    () => () => {
      animRef.current?.stop();
      music.setTrack('menu');
    },
    []
  );

  return { cover, fadeThroughBlack, revealFromBlack };
}
