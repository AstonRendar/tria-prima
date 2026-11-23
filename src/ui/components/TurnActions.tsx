import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RotationKind } from '@/domain/Cube';
import { ActionButton } from '@/ui/components/ActionButton';
import { colors, fonts, shadows, spacing } from '@/ui/styles/tokens';
import { rotationActions, TurnPhase } from '@/ui/turnFlow';

const ROTATIONS = rotationActions();

type Props = {
  phase: TurnPhase;
  // Texto de ayuda de la fase (o lo que pasa mientras no es tu turno).
  hint: string;
  // Falso durante el turno del rival: solo se muestra el texto.
  enabled: boolean;
  onRotate: (kind: RotationKind) => void;
  onStartSwap: () => void;
  onCancelAction: () => void;
  onCancelSwap: () => void;
  onEndTurn: () => void;
  // Presente solo cuando la regla permite adivinar ahora mismo.
  onGuess?: () => void;
  hintTestID?: string;
};

// Barra fija al pie de la partida: ayuda de la fase y los botones que tocan.
// Tiene altura constante para que el tablero no salte al cambiar de fase.
export function TurnActions({
  phase,
  hint,
  enabled,
  onRotate,
  onStartSwap,
  onCancelAction,
  onCancelSwap,
  onEndTurn,
  onGuess,
  hintTestID,
}: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: spacing.sm + insets.bottom }]} testID="turn-actions">
      <Text style={styles.hint} numberOfLines={2} testID={hintTestID}>
        {hint}
      </Text>
      <View style={styles.row}>{enabled && renderButtons()}</View>
    </View>
  );

  function renderButtons() {
    if (phase === 'choose-action') {
      return (
        <>
          {ROTATIONS.map((r) => (
            <ActionButton
              key={r.kind}
              compact
              label={r.label}
              onPress={() => onRotate(r.kind)}
              testID={`action/${r.kind}`}
            />
          ))}
          <ActionButton compact label="Intercambiar" onPress={onStartSwap} testID="action/swap" />
          <ActionButton
            compact
            label="✕"
            accessibilityLabel="Cancelar"
            onPress={onCancelAction}
            testID="action/cancel"
          />
        </>
      );
    }
    if (phase === 'select-second-cube') {
      return (
        <ActionButton compact label="Cancelar intercambio" onPress={onCancelSwap} testID="action/cancel-swap" />
      );
    }
    if (phase === 'declare') {
      return (
        <>
          {onGuess && (
            <ActionButton compact label="Adivinar" variant="danger" onPress={onGuess} testID="guess/open" />
          )}
          <ActionButton compact label="Acabar turno" variant="primary" onPress={onEndTurn} testID="turn/end" />
        </>
      );
    }
    return null;
  }
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1.5,
    borderTopColor: colors.gold,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    ...shadows.raised,
  },
  hint: {
    fontFamily: fonts.serif,
    color: colors.textMuted,
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    minHeight: 34,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 46,
    marginTop: spacing.xs,
  },
});
