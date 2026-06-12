import Svg, { Circle, Line, Path } from 'react-native-svg';
import { CubeSymbol } from '@/domain/Symbol';

type Props = {
  symbol: CubeSymbol;
  size: number;
  color: string;
  strokeWidth?: number;
};

export function AlchemicalSigil({ symbol, size, color, strokeWidth = 1.8 }: Props) {
  const stroke = {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    fill: 'none' as const,
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" pointerEvents="none">
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
    </Svg>
  );
}
