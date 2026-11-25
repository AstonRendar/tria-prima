import { StyleSheet, Text, TextInput } from 'react-native';
import { useConfirm } from '@/ui/ConfirmProvider';
import { OrnateFrame } from '@/ui/ornaments';
import { normalizeGuess, WORD_LENGTH } from '@/domain/SecretWord';
import { ActionButton } from './ActionButton';
import { colors, fonts, radius, spacing } from '@/ui/styles/tokens';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  hint?: string;
  inputDisabled?: boolean;
  submitDisabled?: boolean;
};

export function GuessBox({
  value,
  onChangeText,
  onSubmit,
  hint,
  inputDisabled,
  submitDisabled,
}: Props) {
  const confirm = useConfirm();
  const letters = normalizeGuess(value).length;
  const canSubmit = !submitDisabled && letters === WORD_LENGTH;
  const askConfirmation = () =>
    confirm({
      title: 'Confirmar',
      message: '¿Seguro que quieres adivinar? Si fallas, pierdes la partida.',
      confirmLabel: 'Adivinar',
      destructive: true,
      onConfirm: onSubmit,
    });
  return (
    <OrnateFrame padding={spacing.md} style={styles.box}>
      <Text style={styles.title}>Adivina la palabra (6 letras)</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      <TextInput
        value={value}
        onChangeText={(text) => onChangeText(text.toUpperCase())}
        placeholder="ESCRIBE AQUÍ"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="characters"
        autoCorrect={false}
        autoComplete="off"
        spellCheck={false}
        returnKeyType="done"
        onSubmitEditing={canSubmit ? askConfirmation : undefined}
        maxLength={10}
        editable={!inputDisabled}
        testID="guess/input"
        style={[styles.input, inputDisabled && styles.inputDisabled]}
      />
      <Text style={styles.counter}>
        Letras: {letters} / {WORD_LENGTH}
      </Text>
      <ActionButton
        label="Adivinar"
        variant="primary"
        onPress={askConfirmation}
        disabled={!canSubmit}
        testID="guess/submit"
      />
    </OrnateFrame>
  );
}

const styles = StyleSheet.create({
  counter: {
    fontFamily: fonts.serif,
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  box: {
    marginTop: spacing.xl,
  },
  title: {
    fontFamily: fonts.serif,
    color: colors.accent,
    fontWeight: '800',
    fontSize: 16,
    marginBottom: spacing.xs,
  },
  hint: {
    fontFamily: fonts.serif,
    color: colors.textMuted,
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: spacing.sm,
  },
  input: {
    fontFamily: fonts.serif,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    fontSize: 18,
    letterSpacing: 3,
    marginBottom: spacing.md,
    backgroundColor: colors.background,
  },
  inputDisabled: {
    opacity: 0.5,
  },
});
