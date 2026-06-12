import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Objective } from '@/domain/Objective';
import { AlchemicalSigil, ColorSeal } from '@/ui/ornaments';
import {
  colors,
  cubeColorLabel,
  cubeSymbolLabel,
  fonts,
  radius,
  shadows,
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
  const label = isColor
    ? cubeColorLabel[objective.value]
    : cubeSymbolLabel[objective.value];

  return (
    <View style={styles.row}>
      <View style={styles.sign}>
        {isColor ? (
          <ColorSeal color={objective.value} size={36} />
        ) : (
          <AlchemicalSigil symbol={objective.value} size={34} color={colors.text} />
        )}
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
    borderColor: colors.gold,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    ...shadows.card,
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
