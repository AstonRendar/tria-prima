import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import { TOUCHES_PER_TURN } from '@/domain/Board';
import { rankFor } from '@/domain/Score';
import { maskedText, plainText, revealedCount, WORD_LENGTH } from '@/domain/SecretWord';
import { buildProductionDependencies } from '@/infrastructure/ProductionDependencies';
import { audio } from '@/ui/audio/sound';
import { CubeGrid } from '@/ui/components/CubeGrid';
import { EndScreen } from '@/ui/components/EndScreen';
import { FlashMessage, useFlash } from '@/ui/components/FlashMessage';
import { Footer } from '@/ui/components/Footer';
import { GuessBox } from '@/ui/components/GuessBox';
import { HeaderBackButton } from '@/ui/components/HeaderBackButton';
import { NewGameButton } from '@/ui/components/NewGameButton';
import { ObjectiveCard } from '@/ui/components/ObjectiveCard';
import { TurnActions } from '@/ui/components/TurnActions';
import { WordTrack } from '@/ui/components/WordTrack';
import { useExitGuard } from '@/ui/hooks/useExitGuard';
import { useGameMusic } from '@/ui/hooks/useGameMusic';
import { useSoloPlay } from '@/ui/hooks/useSoloPlay';
import { useTurnController } from '@/ui/hooks/useTurnController';
import { FiligreeDivider, OrnateFrame, ParchmentBackground } from '@/ui/ornaments';
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
  const [guess, setGuess] = useState('');
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

  const onEndTurn = () => {
    setGuess('');
    turnCtl.onEndTurn();
  };

  const onGuess = () => {
    if (guess.trim().length === 0) return;
    solo.guess(guess);
  };

  const onRestart = () => {
    solo.restart();
    turnCtl.reset();
    setGuess('');
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

  const phaseHint = describePhase(turn.phase, turn.touched.size, state.turn === 0);
  const myBlocked = state.objectives.filter((s) => s.blockedBy !== null);
  const availableSlots = state.objectives.filter((s) => s.blockedBy === null);

  return (
    <View style={styles.page}>
      <ParchmentBackground />
      <ScrollView contentContainerStyle={styles.container}>
      <NewGameButton onConfirm={onRestart} />

      <View style={styles.headerRow}>
        <Stat label="Turno" value={String(state.turn + 1)} />
        <Stat label="Reveladas" value={`${revealedCount(state.secretWord)} / ${WORD_LENGTH}`} />
        <Stat label="Tocados" value={`${turn.touched.size} / ${TOUCHES_PER_TURN}`} />
      </View>

      <Text style={styles.heading}>El maestro ha sellado una palabra</Text>
      <Text style={styles.maskedWord}>{maskedText(state.secretWord)}</Text>
      <WordTrack word={state.secretWord} />

      {state.turn === 0 && (
        <Text style={styles.firstTurnNotice} testID="first-turn-notice">
          Primer turno: solo movimiento. No se declaran objetivos.
        </Text>
      )}
      <Text style={styles.phaseHint}>{phaseHint}</Text>

      <View style={styles.boardRow}>
        <CubeGrid
          board={state.board}
          selected={turn.selected === null ? [] : [turn.selected]}
          touched={turn.touched}
          animation={turnCtl.animation}
          onPress={turnCtl.onPressCube}
        />
      </View>

      <TurnActions
        phase={turn.phase}
        onRotate={turnCtl.onRotate}
        onStartSwap={turnCtl.onStartSwap}
        onCancelAction={turnCtl.onCancelAction}
        onCancelSwap={turnCtl.onCancelSwap}
        onEndTurn={onEndTurn}
      />

      {solo.canGuessNow && (
        <GuessBox
          value={guess}
          onChangeText={setGuess}
          onSubmit={onGuess}
          hint={`Acabas de descubrir una letra y tienes ${revealedCount(state.secretWord)}. Puedes intentar adivinar antes de acabar el turno.`}
        />
      )}

      <View style={styles.divider}>
        <FiligreeDivider width={170} />
      </View>
      <Text style={styles.sectionTitle}>Objetivos disponibles</Text>
      <View style={styles.objectiveRow}>
        {availableSlots.length === 0 ? (
          <Text style={styles.empty}>Todos los objetivos están bloqueados.</Text>
        ) : (
          availableSlots.map((slot) => (
            <ObjectiveCard key={slot.objective.id} slot={slot} />
          ))
        )}
      </View>

      <Text style={styles.sectionTitle}>Tu zona de bloqueo</Text>
      <View style={styles.objectiveRow}>
        {myBlocked.length === 0 ? (
          <Text style={styles.empty}>Sin objetivos bloqueados.</Text>
        ) : (
          myBlocked.map((slot) => (
            <ObjectiveCard key={slot.objective.id} slot={slot} />
          ))
        )}
      </View>


      <Footer />
      </ScrollView>

      <TutorialTip step={tutorial.step} onDismiss={tutorial.dismiss} onSkip={tutorial.skip} />
      <FlashMessage message={flash.message} />
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <OrnateFrame padding={spacing.sm} cornerScale={0.5} style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </OrnateFrame>
  );
}

const styles = StyleSheet.create({
  boardRow: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
  },
  statLabel: {
    fontFamily: fonts.serif,
    color: colors.textMuted,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontFamily: fonts.serif,
    color: colors.text,
    fontWeight: '700',
    fontSize: 18,
    marginTop: 2,
  },
  heading: {
    fontFamily: fonts.serif,
    color: colors.textMuted,
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  maskedWord: {
    fontFamily: fonts.serif,
    color: colors.accent,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 4,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  phaseHint: {
    fontFamily: fonts.serif,
    color: colors.textMuted,
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  firstTurnNotice: {
    fontFamily: fonts.serif,
    color: colors.danger,
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: spacing.sm,
    marginHorizontal: spacing.lg,
    opacity: 0.85,
  },
  sectionTitle: {
    fontFamily: fonts.serif,
    color: colors.textMuted,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  objectiveRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    rowGap: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  empty: {
    fontFamily: fonts.serif,
    color: colors.textMuted,
    fontStyle: 'italic',
    fontSize: 13,
    paddingHorizontal: spacing.sm,
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
