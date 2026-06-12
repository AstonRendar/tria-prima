import { StyleSheet, Text, View } from 'react-native';
import { SecretWord } from '@/domain/SecretWord';
import { AlchemicalSigil, ColorSeal } from '@/ui/ornaments';
import { colors, fonts, radius } from '@/ui/styles/tokens';
import { RevealFlip } from './RevealFlip';

type Props = {
  word: SecretWord;
};

// Resumen en miniatura del estado de una palabra. Las cartas van en el orden
// de las letras de la palabra (la insignia de cada carta es la que le tocó al
// azar al inicio): así la palabra se lee según se revela.
export function SignCounters({ word }: Props) {
  return (
    <View style={styles.row} testID="sign-counters">
      {word.cards.map((card) => {
        const isColor = card.faceSign.kind === 'color';
        const sign = `${card.faceSign.kind}:${card.faceSign.value}`;
        return (
          <View key={sign} style={styles.cell} testID={`sign-counter/${sign}`}>
            <RevealFlip revealed={card.revealed} style={styles.cellContent}>
              <View style={[styles.signBox, card.revealed && styles.signRevealed]}>
                {isColor ? (
                  <ColorSeal color={card.faceSign.value} size={22} />
                ) : (
                  <AlchemicalSigil
                    symbol={card.faceSign.value}
                    size={20}
                    color={colors.text}
                    strokeWidth={2}
                  />
                )}
              </View>
              <View style={styles.markerRow}>
                {card.revealed ? (
                  <Text style={styles.letter}>{card.letter}</Text>
                ) : (
                  <>
                    <View style={[styles.dot, card.markers >= 1 && styles.dotOn]} />
                    <View style={[styles.dot, card.markers >= 2 && styles.dotOn]} />
                  </>
                )}
              </View>
            </RevealFlip>
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
    marginHorizontal: 4,
  },
  cellContent: {
    alignItems: 'center',
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
    borderColor: colors.gold,
    borderWidth: 2,
  },
  markerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 16,
    marginTop: 2,
  },
  letter: {
    fontFamily: fonts.serif,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '800',
    color: colors.accent,
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
