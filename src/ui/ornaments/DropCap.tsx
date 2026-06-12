import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Rect } from 'react-native-svg';
import { colors, fonts } from '@/ui/styles/tokens';

type Props = {
  letter: string;
  size?: number;
};

export function DropCap({ letter, size = 44 }: Props) {
  return (
    <View style={[styles.box, { width: size, height: size }]}>
      <Svg
        style={StyleSheet.absoluteFill}
        width={size}
        height={size}
        viewBox="0 0 44 44"
        pointerEvents="none"
      >
        <Rect x={1} y={1} width={42} height={42} stroke={colors.gold} strokeWidth={1.4} fill={colors.surface} />
        <Rect x={4.5} y={4.5} width={35} height={35} stroke={colors.text} strokeWidth={0.6} strokeOpacity={0.7} fill="none" />
        <Circle cx={4.5} cy={4.5} r={1.1} fill={colors.gold} />
        <Circle cx={39.5} cy={4.5} r={1.1} fill={colors.gold} />
        <Circle cx={4.5} cy={39.5} r={1.1} fill={colors.gold} />
        <Circle cx={39.5} cy={39.5} r={1.1} fill={colors.gold} />
      </Svg>
      <Text style={[styles.letter, { fontSize: size * 0.58 }]}>{letter}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    fontFamily: fonts.serif,
    fontWeight: '700',
    color: colors.danger,
  },
});
