import { StyleSheet } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { colors, gradients } from '@/ui/styles/tokens';
import { mottling } from './scatter';

const SPECKS = mottling(7, 60, 100, 160);

type Props = {
  tone?: 'light' | 'deep';
};

export function ParchmentBackground({ tone = 'light' }: Props) {
  const edgeOpacity = tone === 'deep' ? 0.2 : 0.12;
  return (
    <Svg
      style={StyleSheet.absoluteFill}
      viewBox="0 0 100 160"
      preserveAspectRatio="xMidYMid slice"
      pointerEvents="none"
    >
      <Defs>
        <RadialGradient id="parchment-base" cx="50%" cy="42%" r="85%">
          <Stop offset="0%" stopColor={gradients.parchment[0]} />
          <Stop offset="55%" stopColor={gradients.parchment[1]} />
          <Stop offset="100%" stopColor={gradients.parchment[2]} />
        </RadialGradient>
        <RadialGradient id="parchment-vignette" cx="50%" cy="50%" r="75%">
          <Stop offset="0%" stopColor={colors.sepia} stopOpacity={0} />
          <Stop offset="78%" stopColor={colors.sepia} stopOpacity={0} />
          <Stop offset="100%" stopColor={colors.sepia} stopOpacity={edgeOpacity} />
        </RadialGradient>
      </Defs>
      <Rect width={100} height={160} fill="url(#parchment-base)" />
      {SPECKS.map((s, i) => (
        <Circle
          key={i}
          cx={s.cx}
          cy={s.cy}
          r={s.r}
          fill={colors.sepia}
          fillOpacity={s.opacity}
        />
      ))}
      <Rect width={100} height={160} fill="url(#parchment-vignette)" />
    </Svg>
  );
}
