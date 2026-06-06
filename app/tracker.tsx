import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import { ALL_OBJECTIVES, Objective } from '@/domain/Objective';
import { canGuess, maskedText, revealedCount } from '@/domain/SecretWord';
import { buildProductionDependencies } from '@/infrastructure/ProductionDependencies';
import { audio } from '@/ui/audio/sound';
import { useConfirm } from '@/ui/ConfirmProvider';
import { EndScreen } from '@/ui/components/EndScreen';
import { FlashMessage, useFlash } from '@/ui/components/FlashMessage';
import { Footer } from '@/ui/components/Footer';
import { GuessBox } from '@/ui/components/GuessBox';
import { HeaderBackButton } from '@/ui/components/HeaderBackButton';
import { NewGameButton } from '@/ui/components/NewGameButton';
import { ObjectiveCounter } from '@/ui/components/ObjectiveCounter';
import { WordTrack } from '@/ui/components/WordTrack';
import { useBeforeUnloadWarning } from '@/ui/hooks/useBeforeUnloadWarning';
import { useTracker } from '@/ui/hooks/useTracker';
import { colors, fonts, spacing } from '@/ui/styles/tokens';

const dependencies = buildProductionDependencies();

export default function Tracker() {
  const router = useRouter();
  const navigation = useNavigation();
  const confirm = useConfirm();
  const tracker = useTracker(dependencies);
  const { state } = tracker;
  const [guess, setGuess] = useState('');
  const flash = useFlash();

  // Hay progreso si la partida no ha terminado y se han generado marcadores
  // o se ha revelado alguna letra. Si nada, la "salida" no destruye nada útil.
  const hasProgress =
    !state.finished &&
    (state.declaredCount.size > 0 ||
      state.secretWord.cards.some((c) => c.markers > 0 || c.revealed));
  useBeforeUnloadWarning(hasProgress);

  const goHome = useCallback(() => {
    router.dismissTo('/');
  }, [router]);

  const requestExit = useCallback(() => {
    if (!hasProgress) {
      goHome();
      return;
    }
    confirm({
      title: 'Salir de la partida',
      message: 'Se perderá el progreso actual. ¿Quieres salir al menú principal?',
      confirmLabel: 'Salir',
      destructive: true,
      onConfirm: goHome,
    });
  }, [confirm, goHome, hasProgress]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => <HeaderBackButton onPress={requestExit} />,
    });
  }, [navigation, requestExit]);

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
      setTimeout(() => audio.play('reveal'), 200);
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
    const fullWord = state.secretWord.cards.map((c) => c.letter).join('');
    return (
      <EndScreen
        won={state.outcome === 'won'}
        word={fullWord}
        onRestart={onRestart}
        onHome={() => router.dismissTo('/')}
      />
    );
  }

  const guessEligible = canGuess(state.secretWord);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <NewGameButton onConfirm={onRestart} />
      <Text style={styles.heading}>Tracker para jugar con el juego físico</Text>
      <Text style={styles.subheading}>
        La app esconde la palabra clave. Cuando completes un objetivo en tu mesa, márcalo aquí.
      </Text>

      <Text style={styles.maskedWord}>{maskedText(state.secretWord)}</Text>
      <WordTrack word={state.secretWord} />

      <Text style={styles.sectionTitle}>Objetivos</Text>
      <Text style={styles.sectionHint}>
        Pulsa ＋ cuando cumplas el objetivo en tu mesa; − si te equivocaste.
        Al acumular 2 marcas se revela la letra de esa carta.
      </Text>
      {ALL_OBJECTIVES.map((objective) => (
        <ObjectiveCounter
          key={objective.id}
          objective={objective}
          count={state.declaredCount.get(objective.id) ?? 0}
          onIncrement={() => onMark(objective)}
          onDecrement={() => tracker.unmark(objective)}
        />
      ))}

      <Text style={styles.statusLine}>
        Reveladas {revealedCount(state.secretWord)} / 6
      </Text>

      {guessEligible && (
        <GuessBox
          value={guess}
          onChangeText={setGuess}
          onSubmit={onGuess}
        />
      )}

      <Footer />

      <FlashMessage message={flash.message} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
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
