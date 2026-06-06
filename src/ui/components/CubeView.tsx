import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Cube, RotationKind, visibleFaces } from '@/domain/Cube';
import { colors, radius, spacing } from '@/ui/styles/tokens';
import { FaceTile } from './FaceTile';

export type CubeAnimationKind = RotationKind | 'swap';

type Props = {
  cube: Cube;
  selected?: boolean;
  locked?: boolean;
  touched?: boolean;
  animationKind?: CubeAnimationKind | null;
  onPress?: () => void;
  testID?: string;
};

const TOP_SIZE = 46;
const SIDE_SIZE = 22;

// La cuadrícula 3×3 más la columna de objetivos disponibles deben caber en
// pantallas de móvil: por debajo de ~480px de ancho el dado se encoge en
// proporción.
function useCubeScale(): number {
  const { width } = useWindowDimensions();
  return Math.min(1, Math.max(0.65, width / 480));
}

// Un cuarto de giro (90°) en lugar de vueltas completas: el dado "cae" desde
// su orientación previa hasta la nueva. La perspectiva da sensación 3D real.
const ANIM_DURATION = 320;
const PERSPECTIVE = 480;

export function CubeView({
  cube,
  selected,
  locked,
  touched,
  animationKind,
  onPress,
  testID,
}: Props) {
  const { top, front, back, left, right } = visibleFaces(cube);
  const cubeScale = useCubeScale();
  const topSize = Math.round(TOP_SIZE * cubeScale);
  const sideSize = Math.round(SIDE_SIZE * cubeScale);
  // Valores en grados: arrancan en el ángulo "antes del giro" y animan a 0
  // para que la cara aterrice ya en su posición final.
  const rotateX = useRef(new Animated.Value(0)).current;
  const rotateY = useRef(new Animated.Value(0)).current;
  const rotateZ = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const previousOrientation = useRef(cube.orientation);

  useEffect(() => {
    if (previousOrientation.current === cube.orientation) return;
    previousOrientation.current = cube.orientation;

    rotateX.setValue(0);
    rotateY.setValue(0);
    rotateZ.setValue(0);
    scale.setValue(1);

    const easing = Easing.out(Easing.cubic);

    switch (animationKind) {
      case 'roll-forward':
        // El dado cae hacia el frente: la cara nueva entra desde arriba.
        rotateX.setValue(-1);
        Animated.timing(rotateX, {
          toValue: 0,
          duration: ANIM_DURATION,
          easing,
          useNativeDriver: true,
        }).start();
        return;
      case 'roll-backward':
        // El dado cae hacia atrás: la cara nueva entra desde abajo.
        rotateX.setValue(1);
        Animated.timing(rotateX, {
          toValue: 0,
          duration: ANIM_DURATION,
          easing,
          useNativeDriver: true,
        }).start();
        return;
      case 'spin-cw':
        // Giro en plano horario: la cara nueva entra rotada hacia la izquierda.
        rotateZ.setValue(-1);
        Animated.timing(rotateZ, {
          toValue: 0,
          duration: ANIM_DURATION,
          easing,
          useNativeDriver: true,
        }).start();
        return;
      case 'spin-ccw':
        rotateZ.setValue(1);
        Animated.timing(rotateZ, {
          toValue: 0,
          duration: ANIM_DURATION,
          easing,
          useNativeDriver: true,
        }).start();
        return;
      case 'swap': {
        // Intercambio: el dado encoge un poco y vuelve. Sin giros — el
        // movimiento real lo da el cambio de posición visual.
        scale.setValue(0.7);
        Animated.timing(scale, {
          toValue: 1,
          duration: ANIM_DURATION,
          easing,
          useNativeDriver: true,
        }).start();
        return;
      }
      default:
        return;
    }
  }, [cube.orientation, animationKind, rotateX, rotateY, rotateZ, scale]);

  const rotateXInterp = rotateX.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-90deg', '90deg'],
  });
  const rotateYInterp = rotateY.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-90deg', '90deg'],
  });
  const rotateZInterp = rotateZ.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-90deg', '90deg'],
  });

  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      disabled={locked || !onPress}
      style={({ pressed }) => [
        styles.outer,
        selected && styles.selected,
        locked && styles.locked,
        touched && styles.touched,
        pressed && !locked && styles.pressed,
      ]}
    >
      <View style={styles.row}>
        <View style={[styles.sideSlot, { width: topSize }]}>
          <FaceTile face={back} size={sideSize} dim />
        </View>
      </View>
      <View style={styles.row}>
        <FaceTile face={left} size={sideSize} dim />
        <View style={{ width: spacing.xs }} />
        <Animated.View
          style={{
            transform: [
              { perspective: PERSPECTIVE },
              { rotateX: rotateXInterp },
              { rotateY: rotateYInterp },
              { rotateZ: rotateZInterp },
              { scale },
            ],
          }}
        >
          <FaceTile face={top} size={topSize} />
        </Animated.View>
        <View style={{ width: spacing.xs }} />
        <FaceTile face={right} size={sideSize} dim />
      </View>
      <View style={styles.row}>
        <View style={[styles.sideSlot, { width: topSize }]}>
          <FaceTile face={front} size={sideSize} dim />
        </View>
      </View>
      {locked && (
        <View style={styles.ring}>
          <Text style={styles.ringText}>⊘</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outer: {
    padding: spacing.xs,
    margin: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  selected: {
    borderColor: colors.accent,
  },
  locked: {
    opacity: 0.7,
  },
  touched: {
    borderColor: colors.danger,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  sideSlot: {
    alignItems: 'center',
  },
  ring: {
    position: 'absolute',
    top: 2,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.locked,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringText: {
    fontSize: 10,
    color: colors.locked,
    fontWeight: '800',
  },
});
