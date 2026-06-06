import { StyleSheet, Text, View } from 'react-native';
import { ObjectiveSlot } from '@/domain/Objective';
import { PlayerId } from '@/domain/Player';
import { colors, fonts, radius, spacing } from '@/ui/styles/tokens';
import { ObjectiveCard } from './ObjectiveCard';

type Props = {
  side: 'left' | 'right';
  playerName: string;
  playerId: PlayerId;
  slots: ReadonlyArray<ObjectiveSlot>;
};

export function ObjectiveBlockedZone({ side, playerName, slots }: Props) {
  return (
    <View style={[styles.zone, side === 'left' ? styles.left : styles.right]}>
      <Text
        style={[styles.title, side === 'right' && styles.titleRight]}
        numberOfLines={1}
      >
        {playerName}
      </Text>
      <View style={styles.column}>
        {slots.length === 0 ? (
          <Text style={styles.empty}>—</Text>
        ) : (
          slots.map((slot) => (
            <ObjectiveCard key={slot.objective.id} slot={slot} compact />
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  zone: {
    width: 60,
    minHeight: 240,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  left: {
    marginRight: spacing.xs,
  },
  right: {
    marginLeft: spacing.xs,
  },
  title: {
    fontFamily: fonts.serif,
    color: colors.accent,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    maxWidth: 56,
    textAlign: 'center',
  },
  titleRight: {
    // Mantiene alineación visual cuando el contenedor está a la derecha del tablero.
  },
  column: {
    alignItems: 'center',
  },
  empty: {
    fontFamily: fonts.serif,
    color: colors.textMuted,
    fontSize: 18,
    paddingVertical: spacing.sm,
  },
});
