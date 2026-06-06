import { StyleSheet, Text, View } from 'react-native';
import { ObjectiveSlot } from '@/domain/Objective';
import { colors, fonts, radius, spacing } from '@/ui/styles/tokens';
import { ObjectiveCard } from './ObjectiveCard';

type Props = {
  playerName: string;
  slots: ReadonlyArray<ObjectiveSlot>;
  testID?: string;
};

// Franja horizontal con los objetivos bloqueados por un jugador.
export function ObjectiveBlockedZone({ playerName, slots, testID }: Props) {
  return (
    <View style={styles.zone} testID={testID}>
      <Text style={styles.title} numberOfLines={2}>
        {playerName}
      </Text>
      <View style={styles.row}>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginVertical: spacing.xs,
    minHeight: 52,
  },
  title: {
    fontFamily: fonts.serif,
    color: colors.accent,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    width: 80,
    marginRight: spacing.sm,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: spacing.xs,
  },
  empty: {
    fontFamily: fonts.serif,
    color: colors.textMuted,
    fontSize: 18,
  },
});
