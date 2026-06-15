import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { music } from '@/ui/audio/music';

const COVER_MS = 550;

// Al empezar la partida la pantalla aparece cubierta y se revela con un
// fundido. La música del menú sigue sonando durante el fundido y, al
// terminar, cede el paso a la pista de partida. Al acabar o salir, vuelve
// la del menú: gestiona tanto el fundido como el cambio de pista.
export function useGameStartTransition(active: boolean): Animated.Value {
  const cover = useRef(new Animated.Value(0)).current;
  const wasActive = useRef(false);

  useEffect(() => {
    if (active && !wasActive.current) {
      wasActive.current = true;
      cover.setValue(1);
      Animated.timing(cover, {
        toValue: 0,
        duration: COVER_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) music.setTrack('game');
      });
    } else if (!active && wasActive.current) {
      wasActive.current = false;
      music.setTrack('menu');
    }
  }, [active, cover]);

  useEffect(() => () => music.setTrack('menu'), []);

  return cover;
}
