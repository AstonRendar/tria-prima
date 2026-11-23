import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '@/ui/styles/tokens';
import { GuessBox } from './GuessBox';

type Props = {
  visible: boolean;
  hint: string;
  onClose: () => void;
  onSubmit: (guess: string) => void;
};

// Panel para adivinar: se abre con el botón «Adivinar» de la barra de acciones,
// así la casilla nunca queda fuera de la pantalla.
export function GuessSheet({ visible, hint, onClose, onSubmit }: Props) {
  const [value, setValue] = useState('');
  const close = () => {
    setValue('');
    onClose();
  };
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        <View style={styles.sheet}>
          <GuessBox
            value={value}
            onChangeText={setValue}
            onSubmit={() => {
              onSubmit(value);
              setValue('');
            }}
            hint={hint}
          />
          <Pressable onPress={close} testID="guess/close" accessibilityRole="button" hitSlop={10}>
            <Text style={styles.close}>Ahora no</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(20, 14, 6, 0.6)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  sheet: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
    paddingTop: 0,
  },
  close: {
    fontFamily: fonts.serif,
    color: colors.textMuted,
    textAlign: 'center',
    fontSize: 15,
    marginTop: spacing.md,
    textDecorationLine: 'underline',
  },
});
