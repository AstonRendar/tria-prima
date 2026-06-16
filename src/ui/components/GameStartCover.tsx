import { Animated, StyleSheet } from 'react-native';

// Velo negro que cubre la pantalla al empezar la partida y se funde para
// revelar el tablero. Lo gobierna useGameStartTransition.
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
    backgroundColor: '#000',
    zIndex: 50,
  },
});
