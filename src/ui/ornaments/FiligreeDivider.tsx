import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '@/ui/styles/tokens';

type Props = {
  width?: number;
  color?: string;
  variant?: 'line' | 'fleuron';
};

export function FiligreeDivider({
  width = 240,
  color = colors.gold,
  variant = 'line',
}: Props) {
  const height = (width / 240) * 18;
  return (
    <Svg width={width} height={height} viewBox="0 0 240 18" pointerEvents="none">
      <Circle cx={5} cy={9} r={1.4} fill={color} />
      <Circle cx={235} cy={9} r={1.4} fill={color} />
      <Path d="M8 9 Q60 7.2 110 8.4 L110 9.6 Q60 10.8 8 9 Z" fill={color} />
      <Path d="M232 9 Q180 7.2 130 8.4 L130 9.6 Q180 10.8 232 9 Z" fill={color} />
      {variant === 'fleuron' ? (
        <>
          <Path
            d="M120 2.5 L125.5 9 L120 15.5 L114.5 9 Z"
            fill="none"
            stroke={color}
            strokeWidth={1.2}
            strokeLinejoin="round"
          />
          <Circle cx={120} cy={9} r={1.6} fill={colors.danger} />
          <Path d="M110 9 C113.5 4.5 116 4.5 117.5 7" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round" />
          <Path d="M110 9 C113.5 13.5 116 13.5 117.5 11" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round" />
          <Path d="M130 9 C126.5 4.5 124 4.5 122.5 7" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round" />
          <Path d="M130 9 C126.5 13.5 124 13.5 122.5 11" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round" />
        </>
      ) : (
        <Path d="M120 5 L124 9 L120 13 L116 9 Z" fill={color} />
      )}
    </Svg>
  );
}
