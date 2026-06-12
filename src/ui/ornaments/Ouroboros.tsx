import { View } from 'react-native';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';
import { CubeSymbol } from '@/domain/Symbol';
import { colors } from '@/ui/styles/tokens';
import { SigilGlyph } from './AlchemicalSigil';

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

// El sigilo (lienzo 24×24) se dibuja con 22 unidades de alto, como en el hero.
const SIGIL_SCALE = 22 / 24;

type GlyphProps = {
  color: string;
  accent: string;
  center?: string;
};

// Emblema completo en un lienzo de 120×120, sin <Svg>: incrustable en otros SVG
// (p. ej. la marca de agua del pergamino, en monocromo).
export function OuroborosGlyph({ color, accent, center = colors.danger }: GlyphProps) {
  return (
    <G>
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
      <Circle cx={60} cy={60} r={2} fill={center} />
      {VERTICES.map((v) => (
        <G
          key={v.symbol}
          transform={`translate(${v.x - 11}, ${v.y - 11}) scale(${SIGIL_SCALE})`}
        >
          <SigilGlyph symbol={v.symbol} color={color} strokeWidth={2.2} />
        </G>
      ))}
    </G>
  );
}

type Props = {
  size: number;
  color?: string;
  accent?: string;
};

export function Ouroboros({ size, color = colors.text, accent = colors.gold }: Props) {
  return (
    <View style={{ width: size, height: size }} pointerEvents="none">
      <Svg width={size} height={size} viewBox="0 0 120 120">
        <OuroborosGlyph color={color} accent={accent} />
      </Svg>
    </View>
  );
}
