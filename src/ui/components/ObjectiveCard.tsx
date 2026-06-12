import { StyleSheet, Text, View } from 'react-native';
import { ObjectiveSlot } from '@/domain/Objective';
import { AlchemicalSigil, ColorSeal } from '@/ui/ornaments';
import {
  colors,
  cubeColorLabel,
  cubeSymbolLabel,
  fonts,
  radius,
  shadows,
  spacing,
} from '@/ui/styles/tokens';

type Props = {
  slot: ObjectiveSlot;
  compact?: boolean;
};

function ObjectiveBadge({ slot, size }: { slot: ObjectiveSlot; size: number }) {
  const { objective } = slot;
  return objective.kind === 'color' ? (
    <ColorSeal color={objective.value} size={size} />
  ) : (
    <AlchemicalSigil symbol={objective.value} size={size} color={colors.text} />
  );
}

export function ObjectiveCard({ slot, compact }: Props) {
  const { objective, blockedBy } = slot;
  const blocked = blockedBy !== null;
  const isColor = objective.kind === 'color';

  if (compact) {
    return (
      <View style={[styles.compactGlyphBox, blocked && styles.blocked]}>
        <ObjectiveBadge slot={slot} size={26} />
      </View>
    );
  }

  return (
    <View style={[styles.card, blocked && styles.blocked]}>
      <View style={styles.glyphBox}>
        <ObjectiveBadge slot={slot} size={34} />
      </View>
      <Text style={styles.label}>
        {isColor ? cubeColorLabel[objective.value] : cubeSymbolLabel[objective.value]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 90,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    marginRight: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.gold,
    alignItems: 'center',
    ...shadows.card,
  },
  blocked: {
    opacity: 0.55,
  },
  glyphBox: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.parchment,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: fonts.serif,
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  compactGlyphBox: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.parchment,
    borderWidth: 1,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
});
