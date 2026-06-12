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
      <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
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
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.gold,
    backgroundColor: colors.surface,
    marginVertical: spacing.xs,
  },
  title: {
    fontFamily: fonts.serif,
    color: colors.accent,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: spacing.xs,
    minHeight: 38,
  },
  empty: {
    fontFamily: fonts.serif,
    color: colors.textMuted,
    fontSize: 18,
  },
});
