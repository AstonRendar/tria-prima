import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts, radius, shadows, spacing } from '@/ui/styles/tokens';

type Variant = 'primary' | 'secondary' | 'danger';

type Props = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  variant?: Variant;
  testID?: string;
};

export function ActionButton({ label, onPress, disabled, variant = 'secondary', testID }: Props) {
  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      disabled={disabled || !onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || !onPress }}
      style={({ pressed }) => [
        styles.btn,
        variant === 'primary' && styles.primary,
        variant === 'danger' && styles.danger,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.label,
          variant === 'primary' && styles.labelPrimary,
          variant === 'danger' && styles.labelDanger,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.gold,
    minWidth: 96,
    alignItems: 'center',
    ...shadows.card,
  },
  primary: {
    backgroundColor: colors.accent,
    borderColor: colors.goldBright,
  },
  danger: {
    backgroundColor: colors.danger,
    borderColor: colors.goldBright,
  },
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.92,
  },
  label: {
    fontFamily: fonts.serif,
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  labelPrimary: {
    color: colors.textOnDark,
  },
  labelDanger: {
    color: colors.textOnDark,
  },
});
