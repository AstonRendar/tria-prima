import { StyleSheet, Text, View } from 'react-native';
import { ObjectiveSlot } from '@/domain/Objective';
import { OrnateFrame } from '@/ui/ornaments';
import { colors, fonts, spacing } from '@/ui/styles/tokens';
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
      <OrnateFrame padding={spacing.sm} cornerScale={0.6}>
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
      </OrnateFrame>
    </View>
  );
}

const styles = StyleSheet.create({
  zone: {
    marginVertical: spacing.xs,
  },
  title: {
    fontFamily: fonts.serif,
    color: colors.accent,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: spacing.xs,
    minHeight: 38,
  },
  empty: {
    fontFamily: fonts.serif,
    color: colors.textMuted,
    fontSize: 18,
  },
});
