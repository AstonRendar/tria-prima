import { StyleSheet, Text, View } from 'react-native';
import { SecretWord } from '@/domain/SecretWord';
import {
  colors,
  cubeColorContrast,
  cubeColorHex,
  cubeSymbolGlyph,
  fonts,
  radius,
} from '@/ui/styles/tokens';

type Props = {
  word: SecretWord;
};

export function WordTrack({ word }: Props) {
  return (
    <View style={styles.row}>
      {word.cards.map((card, i) => {
        const isColor = card.faceSign.kind === 'color';
        const cardColor = isColor ? cubeColorHex[card.faceSign.value] : colors.parchment;
        const glyphColor = isColor
          ? cubeColorContrast[card.faceSign.value]
          : colors.text;
        return (
          <View key={i} style={styles.cell} testID={`word-card/${i}`}>
            <View style={[styles.signBox, { backgroundColor: cardColor }]}>
              {!isColor && (
                <Text style={[styles.signGlyph, { color: glyphColor }]}>
                  {cubeSymbolGlyph[card.faceSign.value]}
                </Text>
              )}
            </View>
            <View style={[styles.letterBox, card.revealed && styles.letterRevealed]}>
              <Text style={[styles.letter, card.revealed && styles.letterRevealedText]}>
                {card.revealed ? card.letter : '·'}
              </Text>
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
    marginHorizontal: 3,
  },
  signBox: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signGlyph: {
    fontFamily: fonts.serif,
    fontSize: 22,
    lineHeight: 24,
    fontWeight: '800',
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  letterBox: {
    width: 40,
    height: 36,
    marginTop: 4,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterRevealed: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  letter: {
    fontFamily: fonts.serif,
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  letterRevealedText: {
    color: colors.textOnDark,
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
