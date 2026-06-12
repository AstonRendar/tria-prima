import { Pressable, StyleSheet, Text } from 'react-native';
import { useConfirm } from '@/ui/ConfirmProvider';
import { colors, fonts, radius, shadows, spacing } from '@/ui/styles/tokens';

type Props = {
  onConfirm: () => void;
  message?: string;
};

const DEFAULT_MESSAGE = '¿Empezar una nueva partida? Se perderá el progreso actual.';

export function NewGameButton({ onConfirm, message }: Props) {
  const confirm = useConfirm();
  const onPress = () => {
    confirm({
      title: 'Nueva partida',
      message: message ?? DEFAULT_MESSAGE,
      confirmLabel: 'Nueva partida',
      destructive: true,
      onConfirm,
    });
  };
  return (
    <Pressable
      onPress={onPress}
      testID="new-game"
      style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
    >
      <Text style={styles.label}>↻ Nueva partida</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.gold,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
  label: {
    fontFamily: fonts.serif,
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
});
