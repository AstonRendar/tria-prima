import { StyleSheet, Text, View } from 'react-native';
import { SecretWord } from '@/domain/SecretWord';
import { RevealFlip } from './RevealFlip';
import { SignGlyph, SignVariant } from './SignGlyph';
import { colors, fonts, radius } from '@/ui/styles/tokens';

type Props = {
  word: SecretWord;
  variant?: SignVariant;
};

export function WordTrack({ word, variant }: Props) {
  return (
    <View style={styles.row}>
      {word.cards.map((card, i) => {
        return (
          <View key={i} style={styles.cell} testID={`word-card/${i}`}>
            <View style={styles.signBox}>
              <SignGlyph sign={card.faceSign} size={32} variant={variant} />
            </View>
            <RevealFlip
              revealed={card.revealed}
              style={[styles.letterBox, card.revealed && styles.letterRevealed]}
            >
              <Text style={[styles.letter, card.revealed && styles.letterRevealedText]}>
                {card.revealed ? card.letter : '·'}
              </Text>
            </RevealFlip>
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
    backgroundColor: colors.parchment,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
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
    borderColor: colors.goldBright,
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
