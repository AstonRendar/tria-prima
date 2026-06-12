import { useCallback, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '@/ui/styles/tokens';

const DEFAULT_TIMEOUT_MS = 1800;

export function useFlash(timeout: number = DEFAULT_TIMEOUT_MS) {
  const [message, setMessage] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (msg: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setMessage(msg);
      timerRef.current = setTimeout(() => setMessage(null), timeout);
    },
    [timeout]
  );

  return { message, show };
}

export function FlashMessage({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <View style={styles.flash}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flash: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.lg,
    right: spacing.lg,
    padding: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.goldBright,
  },
  text: {
    fontFamily: fonts.serif,
    color: colors.textOnDark,
    textAlign: 'center',
    fontSize: 13,
  },
});
