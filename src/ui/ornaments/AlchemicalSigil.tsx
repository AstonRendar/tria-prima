import Svg, { Circle, Line, Path } from 'react-native-svg';
import { CubeSymbol } from '@/domain/Symbol';

type GlyphProps = {
  symbol: CubeSymbol;
  color: string;
  strokeWidth?: number;
};

// Trazos del sigilo en un lienzo de 24×24, sin <Svg>: incrustable en otros SVG.
export function SigilGlyph({ symbol, color, strokeWidth = 1.8 }: GlyphProps) {
  const stroke = {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    fill: 'none' as const,
  };
  return (
    <>
      {symbol === 'sulfur' && (
        <>
          <Path d="M12 3 L17.5 11.5 L6.5 11.5 Z" {...stroke} strokeLinejoin="round" />
          <Line x1={12} y1={11.5} x2={12} y2={21} {...stroke} />
          <Line x1={8} y1={16.5} x2={16} y2={16.5} {...stroke} />
        </>
      )}
      {symbol === 'mercury' && (
        <>
          <Path d="M7 2.5 A 5.5 5.5 0 0 0 17 2.5" {...stroke} />
          <Circle cx={12} cy={10.5} r={4.5} {...stroke} />
          <Line x1={12} y1={15} x2={12} y2={21.5} {...stroke} />
          <Line x1={8.5} y1={18.3} x2={15.5} y2={18.3} {...stroke} />
        </>
      )}
      {symbol === 'salt' && (
        <>
          <Circle cx={12} cy={12} r={8} {...stroke} />
          <Line x1={4} y1={12} x2={20} y2={12} {...stroke} />
        </>
      )}
    </>
  );
}

type Props = GlyphProps & {
  size: number;
};

export function AlchemicalSigil({ symbol, size, color, strokeWidth = 1.8 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" pointerEvents="none">
      <SigilGlyph symbol={symbol} color={color} strokeWidth={strokeWidth} />
    </Svg>
  );
}
