import Svg, { Circle } from 'react-native-svg';
import { CubeColor } from '@/domain/Color';
import { cubeColorContrast, cubeColorHex } from '@/ui/styles/tokens';

type Props = {
  color: CubeColor;
  size: number;
};

export function ColorSeal({ color, size }: Props) {
  const fill = cubeColorHex[color];
  const contrast = cubeColorContrast[color];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" pointerEvents="none">
      <Circle cx={12} cy={12} r={10.5} fill={fill} />
      <Circle
        cx={12}
        cy={12}
        r={7.5}
        fill="none"
        stroke={contrast}
        strokeWidth={0.9}
        strokeOpacity={0.85}
      />
      <Circle cx={12} cy={3} r={1.1} fill={contrast} fillOpacity={0.85} />
    </Svg>
  );
}
