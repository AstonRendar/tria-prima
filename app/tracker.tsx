import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import { ALL_OBJECTIVES, Objective } from '@/domain/Objective';
import { maskedText, plainText, revealedCount } from '@/domain/SecretWord';
import { buildProductionDependencies } from '@/infrastructure/ProductionDependencies';
import { audio } from '@/ui/audio/sound';
import { EndScreen } from '@/ui/components/EndScreen';
import { FlashMessage, useFlash } from '@/ui/components/FlashMessage';
import { Footer } from '@/ui/components/Footer';
import { GuessBox } from '@/ui/components/GuessBox';
import { HeaderBackButton } from '@/ui/components/HeaderBackButton';
import { NewGameButton } from '@/ui/components/NewGameButton';
import { ObjectiveCounter } from '@/ui/components/ObjectiveCounter';
import { WordTrack } from '@/ui/components/WordTrack';
import { useExitGuard } from '@/ui/hooks/useExitGuard';
import { useGameMusic } from '@/ui/hooks/useGameMusic';
import { useTracker } from '@/ui/hooks/useTracker';
import { FiligreeDivider, ParchmentBackground } from '@/ui/ornaments';
import { colors, fonts, spacing } from '@/ui/styles/tokens';

const dependencies = buildProductionDependencies();

export default function Tracker() {
  const router = useRouter();
  const navigation = useNavigation();
  const tracker = useTracker(dependencies);
  const { state } = tracker;
  const [guess, setGuess] = useState('');
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

  const onGuess = () => {
    if (guess.trim().length === 0) return;
    tracker.guess(guess);
  };

  const onRestart = () => {
    tracker.restart();
    setGuess('');
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


  return (
    <View style={styles.page}>
      <ParchmentBackground />
      <ScrollView contentContainerStyle={styles.container}>
      <NewGameButton onConfirm={onRestart} />
      <Text style={styles.heading}>Tracker para jugar con el juego físico</Text>
      <Text style={styles.subheading}>
        La app esconde la palabra clave. Cuando completes un objetivo en tu mesa, márcalo aquí.
      </Text>

      <Text style={styles.maskedWord}>{maskedText(state.secretWord)}</Text>
      <WordTrack word={state.secretWord} variant="physical" />

      <View style={styles.divider}>
        <FiligreeDivider width={170} />
      </View>
      <Text style={styles.sectionTitle}>Objetivos</Text>
      <Text style={styles.sectionHint}>
        Pulsa ＋ cuando cumplas el objetivo en tu mesa; − si te equivocaste (también oculta una letra revelada por error).
        Al acumular 2 marcas se revela la letra de esa carta.
      </Text>
      {ALL_OBJECTIVES.map((objective) => (
        <ObjectiveCounter
          key={objective.id}
          objective={objective}
          count={state.declaredCount.get(objective.id) ?? 0}
          onIncrement={() => onMark(objective)}
          onDecrement={() => tracker.unmark(objective)}
          variant="physical"
        />
      ))}

      <Text style={styles.statusLine}>
        Reveladas {revealedCount(state.secretWord)} / 6
      </Text>

      {tracker.canGuessNow && (
        <GuessBox
          value={guess}
          onChangeText={setGuess}
          onSubmit={onGuess}
        />
      )}

      <Footer />
      </ScrollView>

      <FlashMessage message={flash.message} />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  divider: {
    alignItems: 'center',
    marginTop: spacing.md,
    opacity: 0.8,
  },
  heading: {
    fontFamily: fonts.serif,
    color: colors.accent,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  subheading: {
    fontFamily: fonts.serif,
    color: colors.textMuted,
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  maskedWord: {
    fontFamily: fonts.serif,
    color: colors.accent,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 4,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontFamily: fonts.serif,
    color: colors.textMuted,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  sectionHint: {
    fontFamily: fonts.serif,
    color: colors.textMuted,
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: spacing.sm,
  },
  statusLine: {
    fontFamily: fonts.serif,
    color: colors.textMuted,
    textAlign: 'center',
    fontSize: 13,
    marginTop: spacing.sm,
  },
});
