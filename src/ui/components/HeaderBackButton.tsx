import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts, spacing } from '@/ui/styles/tokens';

type Props = {
  onPress: () => void;
};

export function HeaderBackButton({ onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      testID="header/back"
      accessibilityLabel="Volver al menú"
      style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
    >
      <Text style={styles.label}>←</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  pressed: {
    opacity: 0.7,
  },
  label: {
    fontFamily: fonts.serif,
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
  },
});
