import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { music } from '@/ui/audio/music';

const FADE_MS = 2200;
const MENU_STOP_MS = 850;

// Al empezar la partida la pantalla aparece cubierta y se revela con un
// fundido largo (≥ 2 s). La música del menú se apaga antes de empezar el
// fundido, este transcurre en silencio y la pista de partida arranca al
// terminar. Al acabar o salir, vuelve la del menú.
export function useGameStartTransition(active: boolean): Animated.Value {
  const cover = useRef(new Animated.Value(0)).current;
  const wasActive = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (active && !wasActive.current) {
      wasActive.current = true;
      cover.setValue(1);
      music.pause();
      timerRef.current = setTimeout(() => {
        Animated.timing(cover, {
          toValue: 0,
          duration: FADE_MS,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (!finished) return;
          music.setTrack('game');
          if (music.isEnabled()) music.start();
        });
      }, MENU_STOP_MS);
    } else if (!active && wasActive.current) {
      wasActive.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
      music.setTrack('menu');
    }
  }, [active, cover]);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      music.setTrack('menu');
    },
    []
  );

  return cover;
}
