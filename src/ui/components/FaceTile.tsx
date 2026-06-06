import { StyleSheet, Text, View } from 'react-native';
import { Face } from '@/domain/Face';
import {
  cubeColorContrast,
  cubeColorHex,
  cubeSymbolGlyph,
  fonts,
  radius,
} from '@/ui/styles/tokens';

type Props = {
  face: Face;
  size: number;
  dim?: boolean;
};

export function FaceTile({ face, size, dim }: Props) {
  const fontSize = size * 0.55;
  return (
    <View
      style={[
        styles.tile,
        {
          width: size,
          height: size,
          backgroundColor: cubeColorHex[face.color],
          opacity: dim ? 0.55 : 1,
        },
      ]}
    >
      <Text
        style={[
          styles.glyph,
          {
            color: cubeColorContrast[face.color],
            fontSize,
            lineHeight: fontSize * 1.1,
          },
        ]}
      >
        {cubeSymbolGlyph[face.symbol]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  glyph: {
    fontFamily: fonts.serif,
    fontWeight: '800',
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
});
