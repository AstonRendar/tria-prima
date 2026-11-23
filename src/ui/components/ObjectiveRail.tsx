import { StyleSheet, Text, View } from 'react-native';
import { ObjectiveSlot } from '@/domain/Objective';
import { AlchemicalSigil, ColorSeal } from '@/ui/ornaments';
import { colors, fonts, radius, signName, spacing } from '@/ui/styles/tokens';

export type SlotOwner = 'free' | 'mine' | 'rival';

type Props = {
  slots: ReadonlyArray<ObjectiveSlot>;
  ownerOf: (slot: ObjectiveSlot) => SlotOwner;
};

const OWNER_LABEL: Record<SlotOwner, string> = {
  free: 'libre',
  mine: 'en tu zona de bloqueo',
  rival: 'bloqueado por el rival',
};

function ObjectiveBadge({ slot, size }: { slot: ObjectiveSlot; size: number }) {
  const { objective } = slot;
  return objective.kind === 'color' ? (
    <ColorSeal color={objective.value} size={size} />
  ) : (
    <AlchemicalSigil symbol={objective.value} size={size} color={colors.text} />
  );
}

// Los seis objetivos en una columna junto al tablero, cada uno con su estado:
// libre, en la zona de bloqueo propia (borde dorado) o en la del rival
// (atenuado y tachado). Sustituye a las zonas de bloqueo separadas.
export function ObjectiveRail({ slots, ownerOf }: Props) {
  return (
    <View style={styles.rail}>
      {slots.map((slot) => {
        const owner = ownerOf(slot);
        return (
          <View
            key={slot.objective.id}
            style={[styles.box, owner === 'mine' && styles.mine, owner === 'rival' && styles.rival]}
            accessible
            accessibilityLabel={`Objetivo ${signName(slot.objective)}, ${OWNER_LABEL[owner]}`}
            testID={`objective-card/${slot.objective.id}`}
          >
            <ObjectiveBadge slot={slot} size={24} />
            {owner === 'rival' && <Text style={styles.mark}>⊘</Text>}
            {owner === 'mine' && <Text style={[styles.mark, styles.markMine]}>★</Text>}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    marginLeft: spacing.sm,
    alignItems: 'center',
  },
  box: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: colors.parchment,
    borderWidth: 1,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  mine: {
    borderWidth: 2.5,
    borderColor: colors.goldBright,
    backgroundColor: colors.parchmentLight,
  },
  rival: {
    opacity: 0.4,
  },
  mark: {
    position: 'absolute',
    top: -6,
    right: -6,
    fontSize: 12,
    color: colors.danger,
    fontFamily: fonts.serif,
  },
  markMine: {
    color: colors.gold,
  },
});
