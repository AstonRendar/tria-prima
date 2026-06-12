import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { FiligreeDivider, OrnateFrame } from '@/ui/ornaments';
import { colors, fonts, radius, shadows, spacing } from '@/ui/styles/tokens';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  destructive,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      testID="confirm-dialog"
    >
      <Pressable style={styles.backdrop} onPress={onCancel} testID="confirm/backdrop">
        <Pressable style={styles.dialog} onPress={() => {}}>
          <OrnateFrame padding={spacing.xl} style={shadows.raised as object}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.titleRule}>
              <FiligreeDivider width={150} />
            </View>
            <Text style={styles.message}>{message}</Text>
            <View style={styles.buttons}>
              <Pressable
                onPress={onCancel}
                testID="confirm/cancel"
                style={({ pressed }) => [
                  styles.btn,
                  styles.btnSecondary,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.btnSecondaryText}>{cancelLabel ?? 'Cancelar'}</Text>
              </Pressable>
              <Pressable
                onPress={onConfirm}
                testID="confirm/ok"
                style={({ pressed }) => [
                  styles.btn,
                  destructive ? styles.btnDanger : styles.btnPrimary,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.btnDarkText}>{confirmLabel ?? 'Aceptar'}</Text>
              </Pressable>
            </View>
          </OrnateFrame>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(20, 14, 6, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  dialog: {
    width: '100%',
    maxWidth: 360,
  },
  title: {
    fontFamily: fonts.serif,
    color: colors.accent,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  titleRule: {
    marginBottom: spacing.md,
  },
  message: {
    fontFamily: fonts.serif,
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  btn: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    minWidth: 110,
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  btnSecondary: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnSecondaryText: {
    fontFamily: fonts.serif,
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  btnPrimary: {
    backgroundColor: colors.accent,
  },
  btnDanger: {
    backgroundColor: colors.danger,
  },
  btnDarkText: {
    fontFamily: fonts.serif,
    color: colors.textOnDark,
    fontWeight: '700',
    fontSize: 14,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
});
