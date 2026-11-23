import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import { otherPlayer, PlayerId } from '@/domain/Player';
import { plainText, revealedCount } from '@/domain/SecretWord';
import { buildProductionDependencies } from '@/infrastructure/ProductionDependencies';
import { opponentOf } from '@/application/MatchState';
import { audio } from '@/ui/audio/sound';
import { ActionButton } from '@/ui/components/ActionButton';
import { CubeGrid } from '@/ui/components/CubeGrid';
import { EndScreen } from '@/ui/components/EndScreen';
import { FlashMessage, useFlash } from '@/ui/components/FlashMessage';
import { GuessSheet } from '@/ui/components/GuessSheet';
import { HeaderBackButton } from '@/ui/components/HeaderBackButton';
import { LockZone, ObjectiveRail } from '@/ui/components/ObjectiveRail';
import { SetupScreen } from '@/ui/components/SetupScreen';
import { SignCounters } from '@/ui/components/SignCounters';
import { TurnActions } from '@/ui/components/TurnActions';
import { WordTrack } from '@/ui/components/WordTrack';
import { useExitGuard } from '@/ui/hooks/useExitGuard';
import { useGameMusic } from '@/ui/hooks/useGameMusic';
import { useMatch } from '@/ui/hooks/useMatch';
import { useTurnController } from '@/ui/hooks/useTurnController';
import { OrnateFrame, ParchmentBackground } from '@/ui/ornaments';
import { colors, fonts, spacing } from '@/ui/styles/tokens';
import { describePhase } from '@/ui/turnFlow';
import { gameTourSteps } from '@/ui/tutorial/tourSteps';
import { TourOverlay } from '@/ui/tutorial/TourOverlay';
import { TourTarget } from '@/ui/tutorial/TourTargets';
import { TutorialTip } from '@/ui/tutorial/TutorialTip';
import { useTour } from '@/ui/tutorial/useTour';
import { useTutorial } from '@/ui/tutorial/useTutorial';

const dependencies = buildProductionDependencies();
const TOUR_STEPS = gameTourSteps('duel');

export default function Play() {
  const router = useRouter();
  const navigation = useNavigation();
  const match = useMatch(dependencies);
  const { state } = match;
  const [guessOpen, setGuessOpen] = useState(false);
  const [handoffPlayerId, setHandoffPlayerId] = useState<PlayerId | null>(null);
  const flash = useFlash();
  const previousTurnRef = useRef(0);

  const hasActiveGame = state !== null && !state.finished;
  useExitGuard(hasActiveGame, 'Salir del duelo');
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
    port: match,
    locked: state?.board.lockedThisTurn ?? [],
    canDeclare: state?.canDeclareThisTurn ?? false,
    enabled: hasActiveGame,
    showMessage: flash.show,
  });

  const opponentWord = state ? opponentOf(state, state.currentPlayerId).secretWord : null;
  const tour = useTour('game', TOUR_STEPS, hasActiveGame && handoffPlayerId === null);
  const tutorial = useTutorial(
    hasActiveGame && !tour.active && opponentWord && handoffPlayerId === null
      ? {
          isMyTurn: true,
          phase: turnCtl.turn.phase,
          touchedCount: turnCtl.turn.touched.size,
          hasLockedCubes: state.board.lockedThisTurn.length > 0,
          anyMarker: opponentWord.cards.some((c) => c.markers > 0 || c.revealed),
          canGuess: match.canGuessNow,
        }
      : null
  );

  // Tras avanzar de turno, abre el "pasa el dispositivo".
  useEffect(() => {
    if (!state) {
      previousTurnRef.current = 0;
      return;
    }
    if (state.turn > 0 && state.turn !== previousTurnRef.current) {
      setHandoffPlayerId(state.currentPlayerId);
    }
    previousTurnRef.current = state.turn;
  }, [state]);

  useEffect(() => {
    if (!state?.finished) return;
    audio.play(state.failedGuessBy === null ? 'win' : 'lose');
  }, [state?.finished, state?.failedGuessBy]);

  if (!state) {
    return <SetupScreen onStart={(setup) => match.start(setup)} />;
  }

  const me = state.currentPlayerId;
  const opponent = opponentOf(state, me);
  const { turn } = turnCtl;

  const onEndTurn = () => turnCtl.onEndTurn();

  const onRestart = () => {
    match.restart();
    turnCtl.reset();
    setGuessOpen(false);
    setHandoffPlayerId(null);
  };

  if (state.finished) {
    const winner: PlayerId = state.outcome === 'p1-wins' ? 'p1' : 'p2';
    const loser = otherPlayer(winner);
    const failed = state.failedGuessBy !== null;
    return (
      <View style={styles.page}>
        <ParchmentBackground />
        <EndScreen won word={plainText(state.players[loser].secretWord)} onRestart={onRestart} onHome={goHome}>
          <View style={styles.endStats}>
            <Text style={styles.endStat}>Gana {state.players[winner].name}</Text>
            <Text style={styles.endStat}>
              {failed
                ? `${state.players[loser].name} falló al adivinar. Era la palabra de ${state.players[winner].name}: ${plainText(state.players[winner].secretWord)}`
                : `Descifró la palabra de ${state.players[loser].name}`}
            </Text>
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
          <Text style={styles.turnBadge} numberOfLines={1}>
            Turno de <Text style={styles.turnBadgeName}>{state.players[me].name}</Text>
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Palabra de {opponent.name}</Text>
        <TourTarget id="word">
          <WordTrack word={opponent.secretWord} compact />
        </TourTarget>
        <LockZone
          slots={state.objectives.filter((slot) => slot.blockedBy !== null && slot.blockedBy !== me)}
          label={`Zona de bloqueo de ${opponent.name}`}
          testID="lock-zone/rival"
        />

        <View style={styles.boardRow}>
          <TourTarget id="board">
            <CubeGrid
              board={state.board}
              selected={turn.selected === null ? [] : [turn.selected]}
              touched={turn.touched}
              animation={turnCtl.animation}
              onPress={turnCtl.onPressCube}
            />
          </TourTarget>
          <TourTarget id="objectives">
            <ObjectiveRail
              slots={state.objectives}
              ownerOf={(slot) => (slot.blockedBy === null ? 'free' : slot.blockedBy === me ? 'mine' : 'rival')}
            />
          </TourTarget>
        </View>
        <LockZone
          slots={state.objectives.filter((slot) => slot.blockedBy === me)}
          label="Tu zona de bloqueo"
          testID="lock-zone/mine"
        />

        <TourTarget id="my-word" style={styles.myRow}>
          <Text style={styles.sectionLabel}>Tu palabra, {state.players[me].name}</Text>
          <SignCounters word={state.players[me].secretWord} />
        </TourTarget>
      </ScrollView>

      <TourTarget id="actions">
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
          onGuess={match.canGuessNow ? () => setGuessOpen(true) : undefined}
        />
      </TourTarget>

      <GuessSheet
        visible={guessOpen && match.canGuessNow}
        hint={`${state.players[me].name}, acabas de descubrir una letra y tienes ${revealedCount(opponent.secretWord)} de ${opponent.name}. Solo hay un intento.`}
        onClose={() => setGuessOpen(false)}
        onSubmit={(value) => {
          setGuessOpen(false);
          match.guess(value);
        }}
      />
      <TourOverlay
        step={tour.step}
        index={tour.index}
        total={tour.total}
        onNext={tour.next}
        onSkip={tour.skip}
      />
      {handoffPlayerId === null && (
        <TutorialTip step={tutorial.step} onDismiss={tutorial.dismiss} onSkip={tutorial.skip} />
      )}
      <FlashMessage message={flash.message} />

      {handoffPlayerId && (
        <Handoff
          name={state.players[handoffPlayerId].name}
          onContinue={() => setHandoffPlayerId(null)}
        />
      )}
    </View>
  );
}

function Handoff({ name, onContinue }: { name: string; onContinue: () => void }) {
  return (
    <View style={styles.handoffOverlay}>
      <OrnateFrame padding={spacing.xl} style={styles.handoffBox}>
        <Text style={styles.handoffTitle}>Cambio de turno</Text>
        <Text style={styles.handoffBody}>
          Pasa el dispositivo a <Text style={styles.handoffName}>{name}</Text>.
        </Text>
        <ActionButton
          label="Continuar"
          variant="primary"
          onPress={onContinue}
          testID="handoff/continue"
        />
      </OrnateFrame>
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
    flexGrow: 1,
    justifyContent: 'center',
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
  turnBadge: {
    fontFamily: fonts.serif,
    color: colors.textMuted,
    fontSize: 13,
  },
  turnBadgeName: {
    color: colors.accent,
    fontSize: 17,
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
    alignItems: 'center',
    marginTop: spacing.md,
  },
  myRow: {
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
  handoffOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(20, 14, 6, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  handoffBox: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  handoffTitle: {
    fontFamily: fonts.serif,
    color: colors.accent,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: spacing.md,
  },
  handoffBody: {
    fontFamily: fonts.serif,
    color: colors.text,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  handoffName: {
    color: colors.accent,
    fontWeight: '800',
  },
});
