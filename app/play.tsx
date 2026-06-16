import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import { TOUCHES_PER_TURN } from '@/domain/Board';
import { RotationKind } from '@/domain/Cube';
import { GRID_SIZE, Position } from '@/domain/Position';
import { otherPlayer, PlayerId } from '@/domain/Player';
import { canGuess, maskedText, revealedCount } from '@/domain/SecretWord';
import { buildProductionDependencies } from '@/infrastructure/ProductionDependencies';
import { opponentOf } from '@/application/MatchState';
import { audio } from '@/ui/audio/sound';
import { useConfirm } from '@/ui/ConfirmProvider';
import { ActionButton } from '@/ui/components/ActionButton';
import { CubeAnimationKind, CubeView } from '@/ui/components/CubeView';
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
import { WordTrack } from '@/ui/components/WordTrack';
import { useBeforeUnloadWarning } from '@/ui/hooks/useBeforeUnloadWarning';
import { useGameStartTransition } from '@/ui/hooks/useGameStartTransition';
import { useMatch } from '@/ui/hooks/useMatch';
import { FiligreeDivider, OrnateFrame, ParchmentBackground } from '@/ui/ornaments';
import { colors, fonts, spacing } from '@/ui/styles/tokens';
import {
  cancelAction,
  cancelSwap,
  canFinishTurn,
  commitSwap,
  describeDeclareResult,
  describePhase,
  pressCube,
  rotateSelected,
  rotationActions,
  startSwap,
  TurnPhase,
  TurnState,
  turnMessage,
} from '@/ui/turnFlow';

const dependencies = buildProductionDependencies();

const ROTATIONS = rotationActions();

export default function Play() {
  const router = useRouter();
  const navigation = useNavigation();
  const confirm = useConfirm();
  const match = useMatch(dependencies);
  const [phase, setPhase] = useState<TurnPhase>('select-cube');
  const [selected, setSelected] = useState<Position | null>(null);
  const [touched, setTouched] = useState<Set<Position>>(new Set());
  const [guess, setGuess] = useState('');
  const [handoffPlayerId, setHandoffPlayerId] = useState<PlayerId | null>(null);
  const [lastAnimation, setLastAnimation] = useState<{
    positions: ReadonlySet<Position>;
    kind: CubeAnimationKind;
  } | null>(null);
  const flash = useFlash();
  const previousTurnRef = useRef(0);
  const autoDeclaredRef = useRef(false);

  const hasActiveGame = match.state !== null && !match.state.finished;
  useBeforeUnloadWarning(hasActiveGame);
  const { fadeThroughBlack } = useGameStartTransition(hasActiveGame);

  const goHome = useCallback(() => {
    router.dismissTo('/');
  }, [router]);

  const requestExit = useCallback(() => {
    if (!hasActiveGame) {
      goHome();
      return;
    }
    confirm({
      title: 'Salir del duelo',
      message: 'Se perderá la partida en curso. ¿Quieres salir al menú principal?',
      confirmLabel: 'Salir',
      destructive: true,
      onConfirm: goHome,
    });
  }, [confirm, goHome, hasActiveGame]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => <HeaderBackButton onPress={requestExit} />,
    });
  }, [navigation, requestExit]);

  const state = match.state;
  const turnNumber = state?.turn ?? 0;
  const currentPid = state?.currentPlayerId;

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
  }, [state, turnNumber, currentPid]);

  // Al entrar en la fase de declaración, declara automáticamente todos los
  // objetivos cumplidos. El jugador no tiene que pulsar nada.
  useEffect(() => {
    if (phase !== 'declare') {
      autoDeclaredRef.current = false;
      return;
    }
    if (autoDeclaredRef.current) return;
    if (!state || !state.canDeclareThisTurn) return;
    autoDeclaredRef.current = true;
    const result = match.declare();
    if (result.declared > 0) audio.play('objective');
    if (result.revealedCardIndices.length > 0) {
      setTimeout(() => audio.play('reveal'), result.declared > 0 ? 200 : 0);
    }
    const msg = describeDeclareResult(result.declared, result.released, result.revealedCardIndices.length);
    if (msg) flash.show(msg);
  }, [phase, state, match, flash.show]);

  const rows = useMemo(() => {
    const r: number[][] = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      r.push([i * GRID_SIZE, i * GRID_SIZE + 1, i * GRID_SIZE + 2]);
    }
    return r;
  }, []);

  useEffect(() => {
    if (!state?.finished) return;
    const winnerId = state.outcome === 'p1-wins' ? 'p1' : 'p2';
    audio.play(winnerId === state.currentPlayerId ? 'win' : 'lose');
  }, [state?.finished, state?.outcome, state?.currentPlayerId]);

  if (!state) {
    return <SetupScreen onStart={(setup) => fadeThroughBlack(() => match.start(setup))} />;
  }

  const me = state.currentPlayerId;
  const opponent = opponentOf(state, me);

  const applyTurn = (next: TurnState) => {
    setPhase(next.phase);
    setSelected(next.selected);
    setTouched(next.touched as Set<Position>);
  };

  const resetTurn = () => {
    setPhase('select-cube');
    setSelected(null);
    setTouched(new Set());
  };

  const onPressCube = (i: Position) => {
    if (state.finished) return;
    if (state.board.lockedThisTurn.includes(i)) return;
    const current: TurnState = { phase, selected, touched };
    const outcome = pressCube(current, i);
    if (outcome.message) flash.show(turnMessage(outcome.message));
    if (outcome.swap) {
      const { a, b } = outcome.swap;
      if (!match.swap(a, b)) {
        flash.show('Solo puedes intercambiar en la misma fila o columna');
        return;
      }
      audio.play('swap');
      setLastAnimation({ positions: new Set([a, b]), kind: 'swap' });
      applyTurn(commitSwap(a, b));
      return;
    }
    if (outcome.state !== current) applyTurn(outcome.state);
  };

  const onRotate = (kind: RotationKind) => {
    if (selected === null) return;
    const target = selected;
    match.rotate(target, kind);
    audio.play(kind === 'spin-cw' || kind === 'spin-ccw' ? 'cube-spin' : 'cube-roll');
    setLastAnimation({ positions: new Set([target]), kind });
    applyTurn(rotateSelected({ phase, selected, touched }));
  };

  const onStartSwap = () => {
    const outcome = startSwap({ phase, selected, touched });
    if (outcome.message) flash.show(turnMessage(outcome.message));
    applyTurn(outcome.state);
  };

  const onCancelAction = () => applyTurn(cancelAction({ phase, selected, touched }));

  const onCancelSwap = () => applyTurn(cancelSwap({ phase, selected, touched }));

  const onEndTurn = () => {
    if (!canFinishTurn({ phase, selected, touched })) {
      flash.show(`Hay que mover ${TOUCHES_PER_TURN} dados para acabar el turno`);
      return;
    }
    audio.play('turn-end');
    match.finishTurn(Array.from(touched));
    resetTurn();
    setLastAnimation(null);
  };

  const onGuess = () => {
    if (guess.trim().length === 0) return;
    match.guess(guess);
  };

  const onRestart = () => {
    fadeThroughBlack(() => {
      match.restart();
      resetTurn();
      setGuess('');
      setHandoffPlayerId(null);
      setLastAnimation(null);
    });
  };

  if (state.finished) {
    const won = state.outcome === 'p1-wins' ? 'p1' : 'p2';
    const fullWord = state.players[otherPlayer(won)].secretWord.cards
      .map((c) => c.letter)
      .join('');
    const winnerName = state.players[won].name;
    return (
      <View style={styles.page}>
        <ParchmentBackground />
        <EndScreen
          won
          word={fullWord}
          onRestart={onRestart}
          onHome={() => router.dismissTo('/')}
        >
          <View style={styles.endStats}>
            <Text style={styles.endStat}>Gana {winnerName}</Text>
            <Text style={styles.endStat}>Palabra del rival</Text>
          </View>
        </EndScreen>
      </View>
    );
  }

  const guessEligible = canGuess(opponent.secretWord);
  const phaseHint = describePhase(phase, touched.size);
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
        <View style={styles.grid}>
          {rows.map((row, ri) => (
            <View key={ri} style={styles.gridRow}>
              {row.map((i) => (
                <CubeView
                  key={i}
                  cube={state.board.cubes[i]}
                  selected={selected === i}
                  locked={state.board.lockedThisTurn.includes(i)}
                  touched={touched.has(i)}
                  animationKind={lastAnimation?.positions.has(i) ? lastAnimation.kind : null}
                  onPress={() => onPressCube(i)}
                  testID={`cube/${i}`}
                />
              ))}
            </View>
          ))}
        </View>
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

      {phase === 'choose-action' && (
        <OrnateFrame padding={spacing.sm} cornerScale={0.7} style={styles.actionPanel}>
          {ROTATIONS.map((r) => (
            <View key={r.kind} style={styles.actionBtn}>
              <ActionButton
                label={r.label}
                onPress={() => onRotate(r.kind)}
                testID={`action/${r.kind}`}
              />
            </View>
          ))}
          <View style={styles.actionBtn}>
            <ActionButton label="Intercambiar…" onPress={onStartSwap} testID="action/swap" />
          </View>
          <View style={styles.actionBtn}>
            <ActionButton label="Cancelar" onPress={onCancelAction} testID="action/cancel" />
          </View>
        </OrnateFrame>
      )}

      {phase === 'select-second-cube' && (
        <OrnateFrame padding={spacing.md} style={styles.swapNotice}>
          <Text style={styles.swapText}>
            Toca otro dado en la misma fila o columna para intercambiarlos.
          </Text>
          <ActionButton
            label="Cancelar"
            onPress={onCancelSwap}
            testID="action/cancel-swap"
          />
        </OrnateFrame>
      )}

      {phase === 'declare' && (
        <View style={styles.actionRow}>
          <ActionButton
            label="Acabar turno"
            variant="primary"
            onPress={onEndTurn}
            testID="turn/end"
          />
        </View>
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

      {guessEligible && (
        <GuessBox
          value={guess}
          onChangeText={setGuess}
          onSubmit={onGuess}
          hint={`${state.players[me].name}, tienes ${revealedCount(opponent.secretWord)} letras de ${opponent.name}. Puedes intentar adivinar.`}
        />
      )}

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
  grid: {
    alignItems: 'center',
  },
  gridRow: {
    flexDirection: 'row',
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
  actionPanel: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  actionBtn: {
    marginBottom: spacing.xs,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginVertical: spacing.md,
  },
  swapNotice: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  swapText: {
    fontFamily: fonts.serif,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
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
