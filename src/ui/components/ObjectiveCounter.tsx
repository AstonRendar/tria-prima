import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Objective } from '@/domain/Objective';
import {
  colors,
  cubeColorContrast,
  cubeColorHex,
  cubeColorLabel,
  cubeSymbolGlyph,
  cubeSymbolLabel,
  fonts,
  radius,
  spacing,
} from '@/ui/styles/tokens';

type Props = {
  objective: Objective;
  count: number;
  onIncrement: () => void;
  onDecrement: () => void;
};

export function ObjectiveCounter({ objective, count, onIncrement, onDecrement }: Props) {
  const isColor = objective.kind === 'color';
  const glyph = isColor ? '' : cubeSymbolGlyph[objective.value];
  const tint = isColor ? cubeColorHex[objective.value] : colors.parchment;
  const textColor = isColor ? cubeColorContrast[objective.value] : colors.text;
  const label = isColor
    ? cubeColorLabel[objective.value]
    : cubeSymbolLabel[objective.value];

  return (
    <View style={styles.row}>
      <View style={[styles.sign, { backgroundColor: tint }]}>
        {!isColor && <Text style={[styles.glyph, { color: textColor }]}>{glyph}</Text>}
      </View>
      <View style={styles.middle}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.count}>{count} declaración{count === 1 ? '' : 'es'}</Text>
      </View>
      <View style={styles.buttons}>
        <Pressable
          onPress={onDecrement}
          testID={`objective/${objective.id}/-`}
          style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
        >
          <Text style={styles.btnText}>−</Text>
        </Pressable>
        <Pressable
          onPress={onIncrement}
          testID={`objective/${objective.id}/+`}
          style={({ pressed }) => [styles.btn, styles.btnPrimary, pressed && styles.pressed]}
        >
          <Text style={[styles.btnText, styles.btnTextPrimary]}>＋</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  sign: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: {
    fontFamily: fonts.serif,
    fontSize: 24,
    lineHeight: 26,
    fontWeight: '800',
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  middle: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  label: {
    fontFamily: fonts.serif,
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  count: {
    fontFamily: fonts.serif,
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  buttons: {
    flexDirection: 'row',
  },
  btn: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.xs,
  },
  btnPrimary: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  pressed: {
    transform: [{ scale: 0.95 }],
  },
  btnText: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  btnTextPrimary: {
    color: colors.textOnDark,
  },
});
