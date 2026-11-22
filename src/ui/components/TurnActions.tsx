import { StyleSheet, Text, View } from 'react-native';
import { RotationKind } from '@/domain/Cube';
import { ActionButton } from '@/ui/components/ActionButton';
import { OrnateFrame } from '@/ui/ornaments';
import { colors, fonts, spacing } from '@/ui/styles/tokens';
import { rotationActions, TurnPhase } from '@/ui/turnFlow';

const ROTATIONS = rotationActions();

type Props = {
  phase: TurnPhase;
  onRotate: (kind: RotationKind) => void;
  onStartSwap: () => void;
  onCancelAction: () => void;
  onCancelSwap: () => void;
  onEndTurn: () => void;
};

// Panel de acciones del turno según la fase: girar/intercambiar el dado
// seleccionado, elegir el segundo dado del intercambio o acabar el turno.
export function TurnActions({
  phase,
  onRotate,
  onStartSwap,
  onCancelAction,
  onCancelSwap,
  onEndTurn,
}: Props) {
  if (phase === 'choose-action') {
    return (
      <OrnateFrame padding={spacing.sm} cornerScale={0.7} style={styles.actionPanel}>
        {ROTATIONS.map((r) => (
          <View key={r.kind} style={styles.actionBtn}>
            <ActionButton label={r.label} onPress={() => onRotate(r.kind)} testID={`action/${r.kind}`} />
          </View>
        ))}
        <View style={styles.actionBtn}>
          <ActionButton label="Intercambiar…" onPress={onStartSwap} testID="action/swap" />
        </View>
        <View style={styles.actionBtn}>
          <ActionButton label="Cancelar" onPress={onCancelAction} testID="action/cancel" />
        </View>
      </OrnateFrame>
    );
  }
  if (phase === 'select-second-cube') {
    return (
      <OrnateFrame padding={spacing.md} style={styles.swapNotice}>
        <Text style={styles.swapText}>
          Toca otro dado en la misma fila o columna para intercambiarlos.
        </Text>
        <ActionButton label="Cancelar" onPress={onCancelSwap} testID="action/cancel-swap" />
      </OrnateFrame>
    );
  }
  if (phase === 'declare') {
    return (
      <View style={styles.actionRow}>
        <ActionButton label="Acabar turno" variant="primary" onPress={onEndTurn} testID="turn/end" />
      </View>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  actionPanel: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  actionBtn: {
    marginBottom: spacing.xs,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginVertical: spacing.md,
  },
  swapNotice: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  swapText: {
    fontFamily: fonts.serif,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
});
