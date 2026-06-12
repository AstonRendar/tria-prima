import { Text } from 'react-native';
import { FaceSign } from '@/domain/SecretWord';
import { AlchemicalSigil, ColorSeal } from '@/ui/ornaments';
import { colors, fonts, physicalSymbolGlyph } from '@/ui/styles/tokens';

export type SignVariant = 'alchemy' | 'physical';

type Props = {
  sign: FaceSign;
  size: number;
  variant?: SignVariant;
};

// Insignia de una cara (color o símbolo). La variante 'physical' usa las
// insignias del juego de mesa original: colores planos y letras griegas.
export function SignGlyph({ sign, size, variant = 'alchemy' }: Props) {
  if (sign.kind === 'color') {
    return <ColorSeal color={sign.value} size={size} variant={variant} />;
  }
  if (variant === 'physical') {
    return (
      <Text
        style={{
          fontFamily: fonts.serif,
          color: colors.text,
          fontSize: size * 0.85,
          lineHeight: size,
          fontWeight: '700',
        }}
      >
        {physicalSymbolGlyph[sign.value]}
      </Text>
    );
  }
  return <AlchemicalSigil symbol={sign.value} size={size - 2} color={colors.text} />;
}
