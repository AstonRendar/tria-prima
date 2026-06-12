import { ReactNode, useEffect, useRef } from 'react';
import { Animated, Easing, StyleProp, ViewStyle } from 'react-native';

type Props = {
  revealed: boolean;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

// Medio giro de carta (90° → 0) cuando `revealed` pasa a true: el contenido
// nuevo aterriza ya en su posición final, igual que las caras del dado.
const FLIP_DURATION = 420;
const PERSPECTIVE = 480;

export function RevealFlip({ revealed, children, style }: Props) {
  const angle = useRef(new Animated.Value(0)).current;
  const previousRevealed = useRef(revealed);

  useEffect(() => {
    if (previousRevealed.current === revealed) return;
    previousRevealed.current = revealed;
    if (!revealed) return;
    angle.setValue(1);
    Animated.timing(angle, {
      toValue: 0,
      duration: FLIP_DURATION,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [revealed, angle]);

  const rotateX = angle.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  return (
    <Animated.View
      style={[style, { transform: [{ perspective: PERSPECTIVE }, { rotateX }] }]}
    >
      {children}
    </Animated.View>
  );
}
