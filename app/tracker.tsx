import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ALL_OBJECTIVES, Objective } from '@/domain/Objective';
import { MIN_REVEALED_TO_GUESS, plainText, revealedCount, WORD_LENGTH } from '@/domain/SecretWord';
import { buildProductionDependencies } from '@/infrastructure/ProductionDependencies';
import { audio } from '@/ui/audio/sound';
import { EndScreen } from '@/ui/components/EndScreen';
import { FlashMessage, useFlash } from '@/ui/components/FlashMessage';
import { ActionButton } from '@/ui/components/ActionButton';
import { GuessSheet } from '@/ui/components/GuessSheet';
import { HeaderBackButton } from '@/ui/components/HeaderBackButton';
import { ObjectiveCounter } from '@/ui/components/ObjectiveCounter';
import { WordTrack } from '@/ui/components/WordTrack';
import { useExitGuard } from '@/ui/hooks/useExitGuard';
import { useGameMusic } from '@/ui/hooks/useGameMusic';
import { useTracker } from '@/ui/hooks/useTracker';
import { ParchmentBackground } from '@/ui/ornaments';
import { colors, fonts, shadows, spacing } from '@/ui/styles/tokens';
import { TRACKER_TOUR } from '@/ui/tutorial/tourSteps';
import { TourOverlay } from '@/ui/tutorial/TourOverlay';
import { TourTarget } from '@/ui/tutorial/TourTargets';
import { useTour } from '@/ui/tutorial/useTour';

const dependencies = buildProductionDependencies();

export default function Tracker() {
  const router = useRouter();
  const navigation = useNavigation();
  const tracker = useTracker(dependencies);
  const { state } = tracker;
  const [guessOpen, setGuessOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const flash = useFlash();
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    },
    []
  );

  // Mismo criterio que duelo y solitario: partida sin terminar = confirmar
  // la salida (al entrar ya hay una palabra escondida en juego).
  const hasActiveGame = !state.finished;
  useExitGuard(hasActiveGame, 'Salir de la partida');
  useGameMusic(hasActiveGame);
  const tour = useTour('tracker', TRACKER_TOUR, hasActiveGame);

  const goHome = useCallback(() => {
    router.dismissTo('/');
  }, [router]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => <HeaderBackButton onPress={goHome} />,
    });
  }, [navigation, goHome]);

  useEffect(() => {
    if (!state.finished) return;
    audio.play(state.outcome === 'won' ? 'win' : 'lose');
  }, [state.finished, state.outcome]);

  const onMark = (objective: Objective) => {
    const result = tracker.mark(objective);
    if (!result.applied) {
      flash.show('Esa carta ya está revelada');
      return;
    }
    audio.play('objective');
    if (result.revealedCardIndex !== null) {
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
      revealTimerRef.current = setTimeout(() => audio.play('reveal'), 200);
      flash.show('Letra revelada');
    }
  };

  const onRestart = () => {
    tracker.restart();
    setGuessOpen(false);
  };

  if (state.finished) {
    return (
      <View style={styles.page}>
        <ParchmentBackground />
        <EndScreen
          won={state.outcome === 'won'}
          word={plainText(state.secretWord)}
          onRestart={onRestart}
          onHome={goHome}
        />
      </View>
    );
  }


  const revealed = revealedCount(state.secretWord);

  return (
    <View style={styles.page}>
      <ParchmentBackground />
      <ScrollView style={styles.main} contentContainerStyle={styles.container}>
        <View style={styles.topRow}>
          <Text style={styles.status}>
            Reveladas{' '}
            <Text style={styles.statusValue}>
              {revealed}/{WORD_LENGTH}
            </Text>
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Palabra sellada por el maestro</Text>
        <TourTarget id="word">
          <WordTrack word={state.secretWord} variant="physical" />
        </TourTarget>

        <Text style={styles.hint}>
          Pulsa ＋ cada vez que cumplas un objetivo en tu mesa y − si te equivocaste. Con 2
          marcas se revela la letra.
        </Text>
        <TourTarget id="counters" style={styles.counters}>
          {ALL_OBJECTIVES.map((objective) => (
            <ObjectiveCounter
              key={objective.id}
              objective={objective}
              count={state.declaredCount.get(objective.id) ?? 0}
              onIncrement={() => onMark(objective)}
              onDecrement={() => tracker.unmark(objective)}
              variant="physical"
              compact
              style={styles.counter}
            />
          ))}
        </TourTarget>
      </ScrollView>

      <TourTarget id="guess" style={[styles.bar, { paddingBottom: spacing.sm + insets.bottom }]}>
        <Text style={styles.barHint}>
          {tracker.canGuessNow
            ? 'Ya puedes intentar adivinar. Solo hay un intento.'
            : `Necesitas ${MIN_REVEALED_TO_GUESS} letras para adivinar.`}
        </Text>
        <ActionButton
          label="Adivinar la palabra"
          variant="danger"
          onPress={() => setGuessOpen(true)}
          disabled={!tracker.canGuessNow}
          testID="guess/open"
        />
      </TourTarget>

      <GuessSheet
        visible={guessOpen && tracker.canGuessNow}
        hint={`Tienes ${revealed} letras. Solo hay un intento.`}
        onClose={() => setGuessOpen(false)}
        onSubmit={(value) => {
          setGuessOpen(false);
          tracker.guess(value);
        }}
      />
      <TourOverlay
        step={tour.step}
        index={tour.index}
        total={tour.total}
        onNext={tour.next}
        onSkip={tour.skip}
      />
      <FlashMessage message={flash.message} />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  main: {
    flex: 1,
  },
  container: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  status: {
    fontFamily: fonts.serif,
    color: colors.textMuted,
    fontSize: 13,
  },
  statusValue: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '800',
  },
  sectionLabel: {
    fontFamily: fonts.serif,
    color: colors.textMuted,
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  hint: {
    fontFamily: fonts.serif,
    color: colors.textMuted,
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: spacing.md,
  },
  counters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  counter: {
    width: '48.5%',
  },
  bar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1.5,
    borderTopColor: colors.gold,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    ...shadows.raised,
  },
  barHint: {
    fontFamily: fonts.serif,
    color: colors.textMuted,
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: spacing.xs,
  },
});
