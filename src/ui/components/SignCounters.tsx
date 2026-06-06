import { StyleSheet, Text, View } from 'react-native';
import { ALL_COLORS } from '@/domain/Color';
import { PlayerCard, SecretWord } from '@/domain/SecretWord';
import { ALL_SYMBOLS } from '@/domain/Symbol';
import { colors, cubeColorHex, cubeSymbolGlyph, fonts, radius } from '@/ui/styles/tokens';

type Props = {
  word: SecretWord;
};

// Resumen en miniatura del estado de una palabra, agrupado por insignia
// (3 símbolos + 3 colores) en el mismo orden que los objetivos: de un
// vistazo se ve qué objetivo conviene declarar.
export function SignCounters({ word }: Props) {
  const ordered: PlayerCard[] = [
    ...ALL_SYMBOLS.map((s) =>
      word.cards.find((c) => c.faceSign.kind === 'symbol' && c.faceSign.value === s)
    ),
    ...ALL_COLORS.map((col) =>
      word.cards.find((c) => c.faceSign.kind === 'color' && c.faceSign.value === col)
    ),
  ].filter((c): c is PlayerCard => c !== undefined);

  return (
    <View style={styles.row} testID="sign-counters">
      {ordered.map((card) => {
        const isColor = card.faceSign.kind === 'color';
        const sign = `${card.faceSign.kind}:${card.faceSign.value}`;
        return (
          <View key={sign} style={styles.cell} testID={`sign-counter/${sign}`}>
            <View
              style={[
                styles.signBox,
                isColor && { backgroundColor: cubeColorHex[card.faceSign.value] },
                card.revealed && styles.signRevealed,
              ]}
            >
              {!isColor && (
                <Text style={styles.signGlyph}>
                  {cubeSymbolGlyph[card.faceSign.value]}
                </Text>
              )}
            </View>
            <View style={styles.markerRow}>
              <View style={[styles.dot, card.markers >= 1 && styles.dotOn]} />
              <View style={[styles.dot, card.markers >= 2 && styles.dotOn]} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cell: {
    alignItems: 'center',
    marginHorizontal: 4,
  },
  signBox: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: colors.parchment,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signRevealed: {
    borderColor: colors.accent,
    borderWidth: 2,
  },
  signGlyph: {
    fontFamily: fonts.serif,
    fontSize: 16,
    lineHeight: 18,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  markerRow: {
    flexDirection: 'row',
    marginTop: 3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 2,
    backgroundColor: colors.border,
  },
  dotOn: {
    backgroundColor: colors.danger,
  },
});
