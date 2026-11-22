import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import { otherPlayer, PlayerId } from '@/domain/Player';
import { maskedText, plainText, revealedCount } from '@/domain/SecretWord';
import { buildProductionDependencies } from '@/infrastructure/ProductionDependencies';
import { opponentOf } from '@/application/MatchState';
import { audio } from '@/ui/audio/sound';
import { ActionButton } from '@/ui/components/ActionButton';
import { CubeGrid } from '@/ui/components/CubeGrid';
import { EndScreen } from '@/ui/components/EndScreen';
import { FlashMessage, useFlash } from '@/ui/components/FlashMessage';
import { Footer } from '@/ui/components/Footer';
import { GuessBox } from '@/ui/components/GuessBox';
import { HeaderBackButton } from '@/ui/components/HeaderBackButton';
import { NewGameButton } from '@/ui/components/NewGameButton';
import { ObjectiveBlockedZone } from '@/ui/components/ObjectiveBlockedZone';
import { ObjectiveCard } from '@/ui/components/ObjectiveCard';
import { SetupScreen } from '@/ui/components/SetupScreen';
import { SignCounters } from '@/ui/components/SignCounters';
import { TurnActions } from '@/ui/components/TurnActions';
import { WordTrack } from '@/ui/components/WordTrack';
import { useExitGuard } from '@/ui/hooks/useExitGuard';
import { useGameMusic } from '@/ui/hooks/useGameMusic';
import { useMatch } from '@/ui/hooks/useMatch';
import { useTurnController } from '@/ui/hooks/useTurnController';
import { FiligreeDivider, OrnateFrame, ParchmentBackground } from '@/ui/ornaments';
import { colors, fonts, spacing } from '@/ui/styles/tokens';
import { describePhase } from '@/ui/turnFlow';

const dependencies = buildProductionDependencies();

export default function Play() {
  const router = useRouter();
  const navigation = useNavigation();
  const match = useMatch(dependencies);
  const { state } = match;
  const [guess, setGuess] = useState('');
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

  const onEndTurn = () => {
    setGuess('');
    turnCtl.onEndTurn();
  };

  const onGuess = () => {
    if (guess.trim().length === 0) return;
    match.guess(guess);
  };

  const onRestart = () => {
    match.restart();
    turnCtl.reset();
    setGuess('');
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

  const phaseHint = describePhase(turn.phase, turn.touched.size, !state.canDeclareThisTurn && state.turn === 0);
  const mySlots = state.objectives.filter((s) => s.blockedBy === me);
  const opponentSlots = state.objectives.filter((s) => s.blockedBy === opponent.id);
  const availableSlots = state.objectives.filter((s) => s.blockedBy === null);

  return (
    <View style={styles.page}>
      <ParchmentBackground />
      <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.topRow}>
        <NewGameButton onConfirm={onRestart} />
        <View style={styles.turnBadge}>
          <Text style={styles.turnBadgeLabel}>Turno de</Text>
          <Text style={styles.turnBadgeName} numberOfLines={1}>
            {state.players[me].name}
          </Text>
        </View>
      </View>

      <ObjectiveBlockedZone
        playerName={`Bloqueados de ${opponent.name}`}
        slots={opponentSlots}
        testID="blocked/opponent"
      />

      <Text style={styles.opponentLine}>
        Palabra de {opponent.name}
      </Text>
      <Text style={styles.maskedWord}>{maskedText(opponent.secretWord)}</Text>
      <WordTrack word={opponent.secretWord} />

      {state.turn === 0 && (
        <Text style={styles.firstTurnNotice} testID="first-turn-notice">
          Primer turno: solo movimiento. No se pueden declarar objetivos.
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
        <View style={styles.availableColumn}>
          <Text style={styles.availableTitle}>Libres</Text>
          {availableSlots.length === 0 ? (
            <Text style={styles.empty}>—</Text>
          ) : (
            availableSlots.map((slot) => (
              <ObjectiveCard key={slot.objective.id} slot={slot} compact />
            ))
          )}
        </View>
      </View>

      <TurnActions
        phase={turn.phase}
        onRotate={turnCtl.onRotate}
        onStartSwap={turnCtl.onStartSwap}
        onCancelAction={turnCtl.onCancelAction}
        onCancelSwap={turnCtl.onCancelSwap}
        onEndTurn={onEndTurn}
      />

      {match.canGuessNow && (
        <GuessBox
          value={guess}
          onChangeText={setGuess}
          onSubmit={onGuess}
          hint={`${state.players[me].name}, acabas de descubrir una letra y tienes ${revealedCount(opponent.secretWord)} de ${opponent.name}. Puedes intentar adivinar antes de acabar el turno.`}
        />
      )}

      <View style={styles.divider}>
        <FiligreeDivider width={170} />
      </View>
      <ObjectiveBlockedZone
        playerName={`Bloqueados de ${state.players[me].name}`}
        slots={mySlots}
        testID="blocked/me"
      />
      <Text style={[styles.opponentLine, styles.myWordLine]}>Tu palabra</Text>
      <SignCounters word={state.players[me].secretWord} />

      <Footer />
      </ScrollView>

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
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  divider: {
    alignItems: 'center',
    marginTop: spacing.md,
    opacity: 0.8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  turnBadge: {
    alignItems: 'flex-end',
  },
  turnBadgeLabel: {
    fontFamily: fonts.serif,
    color: colors.textMuted,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  turnBadgeName: {
    fontFamily: fonts.serif,
    color: colors.accent,
    fontSize: 18,
    fontWeight: '800',
    maxWidth: 180,
  },
  opponentLine: {
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
  myWordLine: {
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
  boardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.lg,
  },
  availableColumn: {
    marginLeft: spacing.sm,
    alignItems: 'center',
  },
  availableTitle: {
    fontFamily: fonts.serif,
    color: colors.textMuted,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
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
