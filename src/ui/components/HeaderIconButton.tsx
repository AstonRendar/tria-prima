import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { colors } from '@/ui/styles/tokens';

export type HeaderIconName = 'rules' | 'music' | 'sfx';

type Props = {
  icon: HeaderIconName;
  onPress: () => void;
  testID: string;
  accessibilityLabel: string;
  // Solo para interruptores: apagado se dibuja atenuado y tachado.
  on?: boolean;
};

const ICON_SIZE = 20;
const STROKE = 1.8;

// Botón de icono de la cabecera. Todos comparten círculo, tamaño, trazo y
// color para que reglas, música y efectos se lean como un mismo grupo.
export function HeaderIconButton({ icon, onPress, testID, accessibilityLabel, on }: Props) {
  const isSwitch = on !== undefined;
  const off = isSwitch && !on;
  const color = off ? colors.textMuted : colors.accent;
  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      accessibilityRole={isSwitch ? 'switch' : 'button'}
      accessibilityState={isSwitch ? { checked: on } : undefined}
      accessibilityLabel={accessibilityLabel}
      hitSlop={4}
      style={styles.hit}
    >
      {({ pressed }) => (
        <View style={[styles.circle, { borderColor: color }, pressed && styles.pressed]}>
          <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" testID={`${testID}/icon-${off ? 'off' : 'on'}`}>
            <Glyph icon={icon} color={color} />
            {off && (
              <Line x1={4} y1={4} x2={20} y2={20} stroke={color} strokeWidth={STROKE} strokeLinecap="round" />
            )}
          </Svg>
        </View>
      )}
    </Pressable>
  );
}

function Glyph({ icon, color }: { icon: HeaderIconName; color: string }) {
  const stroke = { stroke: color, strokeWidth: STROKE, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  switch (icon) {
    case 'rules':
      return (
        <>
          <Path d="M8.5 9a3.5 3.5 0 1 1 5 3.2c-.9.4-1.5 1.2-1.5 2.2V15" {...stroke} />
          <Circle cx={12} cy={19} r={1.1} fill={color} />
        </>
      );
    case 'music':
      return (
        <>
          <Path d="M9 18V5l11-2v13" {...stroke} />
          <Circle cx={6.5} cy={18} r={2.5} {...stroke} />
          <Circle cx={17.5} cy={16} r={2.5} {...stroke} />
        </>
      );
    case 'sfx':
      return (
        <>
          <Path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" {...stroke} />
          <Path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" {...stroke} />
        </>
      );
  }
}

const styles = StyleSheet.create({
  hit: {
    width: 40,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
});
