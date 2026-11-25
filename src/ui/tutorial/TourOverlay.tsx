import { useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { ActionButton } from '@/ui/components/ActionButton';
import { OrnateFrame } from '@/ui/ornaments';
import { colors, fonts, radius, shadows, spacing } from '@/ui/styles/tokens';
import { bubblePlacement, Rect, spotlightRect, TourStep } from './tourSteps';
import { useTourTargets } from './TourTargets';

// Espera a que la pantalla haya hecho su layout antes de medir la zona.
const MEASURE_DELAY_MS = 120;
const DIM = 'rgba(20, 16, 8, 0.72)';
// En Android measureInWindow descuenta la barra de estado, pero la capa
// (statusBarTranslucent) empieza en el borde superior de la pantalla.
const STATUS_BAR_OFFSET = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;

type Props = {
  step: TourStep | null;
  index: number;
  total: number;
  onNext: () => void;
  onSkip: () => void;
};

// Capa del tour a pantalla completa (cubre también la cabecera): oscurece todo
// menos la zona del paso, que queda enmarcada, y muestra el globo explicativo
// encima o debajo de ella.
export function TourOverlay({ step, index, total, onNext, onSkip }: Props) {
  const registry = useTourTargets();
  const { width, height } = useWindowDimensions();
  const [measured, setMeasured] = useState<Rect | null>(null);
  const target = step?.target;

  useEffect(() => {
    setMeasured(null);
    if (!target || !registry) return;
    const timer = setTimeout(() => {
      registry.measure(target, setMeasured);
    }, MEASURE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [target, registry, width, height]);

  if (!step) return null;
  const rect = measured ? { ...measured, y: measured.y + STATUS_BAR_OFFSET } : null;
  const hole = rect ? spotlightRect(rect, width, height) : null;
  const placement = bubblePlacement(rect, height);
  const last = index + 1 >= total;

  return (
    <Modal visible transparent statusBarTranslucent navigationBarTranslucent animationType="fade" onRequestClose={onSkip}>
      <View style={StyleSheet.absoluteFill} testID="tour/overlay">
        {hole ? (
          <>
            <View style={[styles.dim, { left: 0, right: 0, top: 0, height: hole.y }]} />
            <View style={[styles.dim, { left: 0, right: 0, top: hole.y + hole.height, bottom: 0 }]} />
            <View style={[styles.dim, { left: 0, width: hole.x, top: hole.y, height: hole.height }]} />
            <View
              style={[
                styles.dim,
                { left: hole.x + hole.width, right: 0, top: hole.y, height: hole.height },
              ]}
            />
            <View
              style={[styles.frame, { left: hole.x, top: hole.y, width: hole.width, height: hole.height }]}
              testID={`tour/spotlight/${step.target}`}
            />
          </>
        ) : (
          <View style={[styles.dim, StyleSheet.absoluteFill]} />
        )}

        <View
          style={[styles.bubbleWrap, placement === 'center' ? styles.centered : placement]}
          pointerEvents="box-none"
        >
          <OrnateFrame padding={spacing.md} cornerScale={0.6} style={[styles.bubble, shadows.raised as object]}>
            <Text style={styles.kicker}>
              Presentación · {index + 1} de {total}
            </Text>
            <Text style={styles.title} testID="tour/title">
              {step.title}
            </Text>
            <Text style={styles.body}>{step.body}</Text>
            <View style={styles.actions}>
              <Pressable onPress={onSkip} testID="tour/skip" accessibilityRole="button" hitSlop={8}>
                <Text style={styles.skip}>Saltar</Text>
              </Pressable>
              <ActionButton
                label={last ? 'A jugar' : 'Siguiente'}
                variant="primary"
                onPress={onNext}
                testID="tour/next"
              />
            </View>
          </OrnateFrame>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  dim: {
    position: 'absolute',
    backgroundColor: DIM,
  },
  frame: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: colors.goldBright,
    borderRadius: radius.md,
  },
  bubbleWrap: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
  },
  centered: {
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  bubble: {
    backgroundColor: colors.parchmentLight,
  },
  kicker: {
    fontFamily: fonts.serif,
    color: colors.textMuted,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontFamily: fonts.serif,
    color: colors.accent,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
    marginBottom: spacing.xs,
  },
  body: {
    fontFamily: fonts.serif,
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  skip: {
    fontFamily: fonts.serif,
    color: colors.textMuted,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
