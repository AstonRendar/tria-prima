import { Animated, StyleSheet } from 'react-native';
import { colors } from '@/ui/styles/tokens';

// Velo de pergamino que cubre la pantalla al empezar la partida y se desvanece
// para revelar el tablero. Lo gobierna useGameStartTransition.
export function GameStartCover({ opacity }: { opacity: Animated.Value }) {
  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, styles.cover, { opacity }]}
    />
  );
}

const styles = StyleSheet.create({
  cover: {
    backgroundColor: colors.background,
    zIndex: 20,
  },
});
