import { View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { CubeSymbol } from '@/domain/Symbol';
import { colors } from '@/ui/styles/tokens';
import { AlchemicalSigil } from './AlchemicalSigil';

type Props = {
  size: number;
  color?: string;
  accent?: string;
};

// Cuerpo: arco de 310° (hueco arriba donde la cabeza muerde la cola).
const BODY = 'M82 21.9 A44 44 0 1 1 44.95 18.66';
const HEAD = 'M72.5 16.4 L79.25 26.66 L84.75 17.14 Z';
const TAIL = 'M54.35 15.24 L46.15 21.95 L43.75 15.37 Z';

// Triángulo inscrito (▽) con los lados recortados para alojar los sigilos.
const TRIANGLE_EDGES = [
  { x1: 48, y1: 45, x2: 72, y2: 45 },
  { x1: 41, y1: 57.1, x2: 53, y2: 77.9 },
  { x1: 79, y1: 57.1, x2: 67, y2: 77.9 },
];

const VERTICES: ReadonlyArray<{ x: number; y: number; symbol: CubeSymbol }> = [
  { x: 34, y: 45, symbol: 'sulfur' },
  { x: 86, y: 45, symbol: 'mercury' },
  { x: 60, y: 90, symbol: 'salt' },
];

export function Ouroboros({ size, color = colors.text, accent = colors.gold }: Props) {
  const scale = size / 120;
  const sigilSize = 22 * scale;
  return (
    <View style={{ width: size, height: size }} pointerEvents="none">
      <Svg width={size} height={size} viewBox="0 0 120 120">
        <Path d={BODY} stroke={color} strokeWidth={7} strokeLinecap="round" fill="none" />
        <Path
          d={BODY}
          stroke={accent}
          strokeWidth={2.5}
          strokeDasharray="1.5 6"
          strokeLinecap="round"
          fill="none"
        />
        <Path d={HEAD} fill={color} />
        <Circle cx={78.8} cy={20} r={1.2} fill={accent} />
        <Path d={TAIL} fill={color} />
        {TRIANGLE_EDGES.map((e, i) => (
          <Line
            key={i}
            x1={e.x1}
            y1={e.y1}
            x2={e.x2}
            y2={e.y2}
            stroke={accent}
            strokeWidth={1.2}
            strokeLinecap="round"
          />
        ))}
        <Circle cx={60} cy={60} r={2} fill={colors.danger} />
      </Svg>
      {VERTICES.map((v) => (
        <View
          key={v.symbol}
          style={{
            position: 'absolute',
            left: v.x * scale - sigilSize / 2,
            top: v.y * scale - sigilSize / 2,
          }}
        >
          <AlchemicalSigil symbol={v.symbol} size={sigilSize} color={color} strokeWidth={2.2} />
        </View>
      ))}
    </View>
  );
}
