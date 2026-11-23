import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import { rankFor } from '@/domain/Score';
import { plainText, revealedCount, WORD_LENGTH } from '@/domain/SecretWord';
import { buildProductionDependencies } from '@/infrastructure/ProductionDependencies';
import { audio } from '@/ui/audio/sound';
import { CubeGrid } from '@/ui/components/CubeGrid';
import { EndScreen } from '@/ui/components/EndScreen';
import { FlashMessage, useFlash } from '@/ui/components/FlashMessage';
import { GuessSheet } from '@/ui/components/GuessSheet';
import { HeaderBackButton } from '@/ui/components/HeaderBackButton';
import { ObjectiveRail } from '@/ui/components/ObjectiveRail';
import { TurnActions } from '@/ui/components/TurnActions';
import { WordTrack } from '@/ui/components/WordTrack';
import { useExitGuard } from '@/ui/hooks/useExitGuard';
import { useGameMusic } from '@/ui/hooks/useGameMusic';
import { useSoloPlay } from '@/ui/hooks/useSoloPlay';
import { useTurnController } from '@/ui/hooks/useTurnController';
import { ParchmentBackground } from '@/ui/ornaments';
import { colors, fonts, spacing } from '@/ui/styles/tokens';
import { describePhase } from '@/ui/turnFlow';
import { TutorialTip } from '@/ui/tutorial/TutorialTip';
import { useTutorial } from '@/ui/tutorial/useTutorial';

const dependencies = buildProductionDependencies();

export default function SoloPlay() {
  const router = useRouter();
  const navigation = useNavigation();
  const solo = useSoloPlay(dependencies);
  const { state } = solo;
  const [guessOpen, setGuessOpen] = useState(false);
  const flash = useFlash();

  const hasActiveGame = !state.finished;
  useExitGuard(hasActiveGame, 'Salir del laboratorio');
  useGameMusic(hasActiveGame);

  const goHome = useCallback(() => {
    router.dismissTo('/');
  }, [router]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => <HeaderBackButton onPress={goHome} />,
    });
  }, [navigation, goHome]);

  const turnCtl = useTurnController({
    port: solo,
    locked: state.board.lockedThisTurn,
    canDeclare: state.canDeclareThisTurn,
    enabled: hasActiveGame,
    showMessage: flash.show,
  });
  const { turn } = turnCtl;
  const tutorial = useTutorial(
    hasActiveGame
      ? {
          isMyTurn: true,
          phase: turn.phase,
          touchedCount: turn.touched.size,
          hasLockedCubes: state.board.lockedThisTurn.length > 0,
          anyMarker: state.secretWord.cards.some((c) => c.markers > 0 || c.revealed),
          canGuess: solo.canGuessNow,
        }
      : null
  );

  useEffect(() => {
    if (!state.finished) return;
    audio.play(state.outcome === 'won' ? 'win' : 'lose');
  }, [state.finished, state.outcome]);

  const onEndTurn = () => turnCtl.onEndTurn();

  const onRestart = () => {
    solo.restart();
    turnCtl.reset();
    setGuessOpen(false);
  };

  if (state.finished) {
    const score = state.finalScore ?? 0;
    const info = rankFor(score);
    return (
      <View style={styles.page}>
        <ParchmentBackground />
        <EndScreen
          won={state.outcome === 'won'}
          word={plainText(state.secretWord)}
          onRestart={onRestart}
          onHome={goHome}
        >
          <View style={styles.endStats}>
            <Text style={styles.endStat}>Turnos: {state.turn + 1}</Text>
            <Text style={styles.endStat}>
              Objetivos iniciales: {state.initialFreeObjectives}
            </Text>
            <Text style={styles.endStat}>Puntuación: {score}</Text>
            <Text style={styles.endRank}>{info.label}</Text>
          </View>
        </EndScreen>
      </View>
    );
  }

  const firstTurn = state.turn === 0;
  const hint = describePhase(turn.phase, turn.touched.size, firstTurn);

  return (
    <View style={styles.page}>
      <ParchmentBackground />
      <ScrollView style={styles.main} contentContainerStyle={styles.container}>
        <View style={styles.topRow}>
          <Text style={styles.status}>
            Turno <Text style={styles.statusValue}>{state.turn + 1}</Text>
            {'  ·  '}Reveladas{' '}
            <Text style={styles.statusValue}>
              {revealedCount(state.secretWord)}/{WORD_LENGTH}
            </Text>
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Palabra sellada por el maestro</Text>
        <WordTrack word={state.secretWord} compact />

        <View style={styles.boardRow}>
          <CubeGrid
            board={state.board}
            selected={turn.selected === null ? [] : [turn.selected]}
            touched={turn.touched}
            animation={turnCtl.animation}
            onPress={turnCtl.onPressCube}
          />
          <ObjectiveRail
            slots={state.objectives}
            ownerOf={(slot) => (slot.blockedBy === null ? 'free' : 'mine')}
          />
        </View>
      </ScrollView>

      <TurnActions
        phase={turn.phase}
        hint={hint}
        hintTestID={firstTurn ? 'first-turn-notice' : undefined}
        enabled
        onRotate={turnCtl.onRotate}
        onStartSwap={turnCtl.onStartSwap}
        onCancelAction={turnCtl.onCancelAction}
        onCancelSwap={turnCtl.onCancelSwap}
        onEndTurn={onEndTurn}
        onGuess={solo.canGuessNow ? () => setGuessOpen(true) : undefined}
      />

      <GuessSheet
        visible={guessOpen && solo.canGuessNow}
        hint={`Acabas de descubrir una letra y tienes ${revealedCount(state.secretWord)}. Solo hay un intento.`}
        onClose={() => setGuessOpen(false)}
        onSubmit={(value) => {
          setGuessOpen(false);
          solo.guess(value);
        }}
      />
      <TutorialTip step={tutorial.step} onDismiss={tutorial.dismiss} onSkip={tutorial.skip} />
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
  boardRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginTop: spacing.md,
  },
  endStats: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  endStat: {
    fontFamily: fonts.serif,
    color: colors.text,
    marginTop: 4,
  },
  endRank: {
    fontFamily: fonts.serif,
    color: colors.danger,
    fontSize: 18,
    fontWeight: '700',
    marginTop: spacing.md,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
