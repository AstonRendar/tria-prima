import { ReactNode, useState } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { colors, gradients, spacing } from '@/ui/styles/tokens';

type Props = {
  children: ReactNode;
  color?: string;
  accent?: string;
  padding?: number;
  fill?: boolean;
  style?: StyleProp<ViewStyle>;
};

const CORNER_OUTER = 'M2 18 L2 9 C2 5.1 5.1 2 9 2 L18 2';
const CORNER_INNER = 'M6 15 C6 10 10 6 15 6';
const CORNER_CURL =
  'M10.5 10.5 C8.5 8.5 9.5 5.5 12.5 5.5 C14.5 5.5 15.5 7.5 14 8.8 C12.8 9.8 11 9 11.4 7.4';

function Corner({ transform, color, accent }: { transform?: string; color: string; accent: string }) {
  return (
    <G transform={transform}>
      <Path d={CORNER_OUTER} stroke={color} strokeWidth={2} strokeLinecap="round" fill="none" />
      <Path d={CORNER_INNER} stroke={accent} strokeWidth={0.9} strokeLinecap="round" fill="none" />
      <Path d={CORNER_CURL} stroke={color} strokeWidth={1} strokeLinecap="round" fill="none" />
    </G>
  );
}

export function OrnateFrame({
  children,
  color = colors.gold,
  accent = colors.text,
  padding = spacing.lg,
  fill = true,
  style,
}: Props) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  return (
    <View
      style={[{ padding }, style]}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        if (width !== size.w || height !== size.h) {
          setSize({ w: width, h: height });
        }
      }}
    >
      {size.w > 0 && size.h > 0 && (
        <Svg
          style={StyleSheet.absoluteFill}
          width={size.w}
          height={size.h}
          pointerEvents="none"
        >
          <Defs>
            <LinearGradient id="frame-fill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={gradients.surface[0]} />
              <Stop offset="100%" stopColor={gradients.surface[1]} />
            </LinearGradient>
          </Defs>
          {fill && (
            <Rect
              x={1}
              y={1}
              width={size.w - 2}
              height={size.h - 2}
              rx={3}
              fill="url(#frame-fill)"
            />
          )}
          <Rect
            x={1.5}
            y={1.5}
            width={size.w - 3}
            height={size.h - 3}
            rx={3}
            stroke={color}
            strokeWidth={1.6}
            fill="none"
          />
          <Rect
            x={5}
            y={5}
            width={size.w - 10}
            height={size.h - 10}
            rx={1.5}
            stroke={accent}
            strokeWidth={0.75}
            strokeOpacity={0.7}
            fill="none"
          />
          <Corner color={color} accent={accent} />
          <Corner color={color} accent={accent} transform={`translate(${size.w}, 0) scale(-1, 1)`} />
          <Corner color={color} accent={accent} transform={`translate(0, ${size.h}) scale(1, -1)`} />
          <Corner color={color} accent={accent} transform={`translate(${size.w}, ${size.h}) scale(-1, -1)`} />
        </Svg>
      )}
      {children}
    </View>
  );
}
