import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ActionButton } from './ActionButton';
import { colors, fonts, spacing } from '@/ui/styles/tokens';

type Props = {
  won: boolean;
  word: string;
  onRestart: () => void;
  onHome: () => void;
  children?: ReactNode;
};

export function EndScreen({ won, word, onRestart, onHome, children }: Props) {
  return (
    <View style={styles.screen}>
      <Text style={[styles.title, { color: won ? colors.success : colors.danger }]}>
        {won ? '¡Has descifrado la clave!' : 'Esta vez no ha podido ser'}
      </Text>
      <Text style={styles.subtitle}>La palabra era</Text>
      <Text style={styles.word}>{word}</Text>
      {children}
      <View style={styles.actions}>
        <ActionButton
          label="Nueva partida"
          variant="primary"
          onPress={onRestart}
          testID="end/restart"
        />
        <View style={{ height: spacing.md }} />
        <ActionButton label="Volver al inicio" onPress={onHome} testID="end/home" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fonts.serif,
    color: colors.textMuted,
    marginTop: spacing.xl,
    fontStyle: 'italic',
  },
  word: {
    fontFamily: fonts.serif,
    color: colors.text,
    fontSize: 36,
    letterSpacing: 6,
    fontWeight: '800',
    marginTop: spacing.sm,
  },
  actions: {
    marginTop: spacing.xl,
    width: '100%',
    maxWidth: 320,
  },
});
