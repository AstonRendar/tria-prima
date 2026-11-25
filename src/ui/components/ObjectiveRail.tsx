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

// Los seis objetivos en una columna junto al tablero. Como en la mesa, la
// carta de un objetivo declarado sale de la columna (queda su hueco) y pasa a
// la zona de bloqueo de quien lo declaró, junto a su palabra (LockZone).
export function ObjectiveRail({ slots, ownerOf }: Props) {
  return (
    <View style={styles.rail}>
      {slots.map((slot) => {
        const owner = ownerOf(slot);
        return (
          <View
            key={slot.objective.id}
            style={[styles.box, owner !== 'free' && styles.gap]}
            accessible
            accessibilityLabel={`Objetivo ${signName(slot.objective)}, ${OWNER_LABEL[owner]}`}
            testID={`objective-card/${slot.objective.id}`}
          >
            {owner === 'free' && <ObjectiveBadge slot={slot} size={24} />}
          </View>
        );
      })}
    </View>
  );
}

type ZoneProps = {
  slots: ReadonlyArray<ObjectiveSlot>;
  label: string;
  testID: string;
};

// Zona de bloqueo de un jugador: las cartas de objetivo que ha declarado y
// que el otro no puede usar hasta que vuelvan a la columna. Altura fija para
// que el tablero no salte al llenarse o vaciarse.
export function LockZone({ slots, label, testID }: ZoneProps) {
  return (
    <View style={styles.zone} testID={testID} accessibilityLabel={label}>
      <Text style={styles.zoneLabel}>{label}</Text>
      <View style={styles.zoneCards}>
        {slots.map((slot) => (
          <View key={slot.objective.id} style={styles.zoneBox} testID={`${testID}/${slot.objective.id}`}>
            <ObjectiveBadge slot={slot} size={20} />
          </View>
        ))}
      </View>
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
  gap: {
    backgroundColor: 'transparent',
    borderStyle: 'dashed',
    borderColor: colors.border,
  },
  zone: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    minHeight: 36,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
  },
  zoneLabel: {
    fontFamily: fonts.serif,
    fontStyle: 'italic',
    color: colors.textMuted,
    fontSize: 12,
    marginRight: spacing.sm,
  },
  zoneCards: {
    flexDirection: 'row',
    columnGap: spacing.xs,
  },
  zoneBox: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    backgroundColor: colors.parchment,
    borderWidth: 1,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
