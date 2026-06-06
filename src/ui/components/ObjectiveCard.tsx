import { StyleSheet, Text, View } from 'react-native';
import { ObjectiveSlot } from '@/domain/Objective';
import {
  colors,
  cubeColorHex,
  cubeColorLabel,
  cubeSymbolGlyph,
  cubeSymbolLabel,
  fonts,
  radius,
  spacing,
} from '@/ui/styles/tokens';

type Props = {
  slot: ObjectiveSlot;
  compact?: boolean;
};

export function ObjectiveCard({ slot, compact }: Props) {
  const { objective, blockedBy } = slot;
  const blocked = blockedBy !== null;
  const isColor = objective.kind === 'color';

  if (compact) {
    return (
      <View
        style={[
          styles.compactGlyphBox,
          isColor && { backgroundColor: cubeColorHex[objective.value] },
          blocked && styles.blocked,
        ]}
      >
        {!isColor && (
          <Text style={styles.compactGlyph}>{cubeSymbolGlyph[objective.value]}</Text>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.card, blocked && styles.blocked]}>
      <View
        style={[
          styles.glyphBox,
          isColor && { backgroundColor: cubeColorHex[objective.value] },
        ]}
      >
        {isColor ? null : (
          <Text style={styles.glyph}>{cubeSymbolGlyph[objective.value]}</Text>
        )}
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
    borderColor: colors.border,
    alignItems: 'center',
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
  glyph: {
    fontFamily: fonts.serif,
    fontSize: 24,
    lineHeight: 26,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
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
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  compactGlyph: {
    fontFamily: fonts.serif,
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
});
