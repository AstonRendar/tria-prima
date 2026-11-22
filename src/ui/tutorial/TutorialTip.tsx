import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ActionButton } from '@/ui/components/ActionButton';
import { OrnateFrame } from '@/ui/ornaments';
import { colors, fonts, shadows, spacing } from '@/ui/styles/tokens';
import { TutorialStep } from './tutorialSteps';

type Props = {
  step: TutorialStep | null;
  onDismiss: () => void;
  onSkip: () => void;
};

// Consejo flotante en la parte inferior: no tapa el tablero entero para que se
// pueda hacer lo que explica.
export function TutorialTip({ step, onDismiss, onSkip }: Props) {
  if (!step) return null;
  return (
    <View style={styles.wrapper} pointerEvents="box-none" testID="tutorial/tip">
      <OrnateFrame padding={spacing.md} cornerScale={0.6} style={[styles.card, shadows.raised as object]}>
        <Text style={styles.kicker}>Tutorial</Text>
        <Text style={styles.title}>{step.title}</Text>
        <Text style={styles.body}>{step.body}</Text>
        <View style={styles.actions}>
          <Pressable
            onPress={onSkip}
            testID="tutorial/skip"
            accessibilityRole="button"
            hitSlop={8}
          >
            <Text style={styles.skip}>Saltar tutorial</Text>
          </Pressable>
          <ActionButton label="Entendido" variant="primary" onPress={onDismiss} testID="tutorial/ok" />
        </View>
      </OrnateFrame>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.lg,
    zIndex: 40,
  },
  card: {
    backgroundColor: colors.parchmentLight,
  },
  kicker: {
    fontFamily: fonts.serif,
    color: colors.textMuted,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontFamily: fonts.serif,
    color: colors.accent,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
    marginBottom: spacing.xs,
  },
  body: {
    fontFamily: fonts.serif,
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  skip: {
    fontFamily: fonts.serif,
    color: colors.textMuted,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
