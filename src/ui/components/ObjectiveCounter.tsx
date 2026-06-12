import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Objective } from '@/domain/Objective';
import { OrnateFrame } from '@/ui/ornaments';
import { SignGlyph, SignVariant } from './SignGlyph';
import {
  colors,
  cubeColorLabel,
  cubeSymbolLabel,
  fonts,
  physicalColorLabel,
  physicalSymbolLabel,
  radius,
  shadows,
  spacing,
} from '@/ui/styles/tokens';

type Props = {
  objective: Objective;
  count: number;
  onIncrement: () => void;
  onDecrement: () => void;
  variant?: SignVariant;
};

export function ObjectiveCounter({
  objective,
  count,
  onIncrement,
  onDecrement,
  variant = 'alchemy',
}: Props) {
  const physical = variant === 'physical';
  const label =
    objective.kind === 'color'
      ? (physical ? physicalColorLabel : cubeColorLabel)[objective.value]
      : (physical ? physicalSymbolLabel : cubeSymbolLabel)[objective.value];

  return (
    <OrnateFrame padding={spacing.sm + 2} cornerScale={0.55} style={[styles.row, shadows.card]}>
      <View style={styles.sign}>
        <SignGlyph sign={objective} size={36} variant={variant} />
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
    </OrnateFrame>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sign: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.parchment,
    alignItems: 'center',
    justifyContent: 'center',
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
