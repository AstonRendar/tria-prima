import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AlchemicalSigil, OrnateFrame, Ouroboros } from '@/ui/ornaments';
import { ActionButton } from './ActionButton';
import { colors, fonts, shadows, spacing } from '@/ui/styles/tokens';

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
      <OrnateFrame padding={spacing.xl} style={[styles.panel, shadows.card]}>
        <Text style={[styles.title, { color: won ? colors.success : colors.danger }]}>
          {won ? '¡Has descifrado la clave!' : 'Esta vez no ha podido ser'}
        </Text>
        <Text style={styles.subtitle}>La palabra era</Text>
        <View style={styles.wordRow}>
          <AlchemicalSigil symbol="sulfur" size={22} color={colors.gold} />
          <Text style={styles.word}>{word}</Text>
          <AlchemicalSigil symbol="mercury" size={22} color={colors.gold} />
        </View>
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
      </OrnateFrame>
      <View style={styles.seal}>
        <Ouroboros size={72} color={colors.sepia} accent={colors.gold} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  panel: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  seal: {
    marginTop: spacing.xl,
    opacity: 0.85,
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
  },
  actions: {
    marginTop: spacing.xl,
    width: '100%',
    maxWidth: 320,
  },
});
