import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import { TOUCHES_PER_TURN } from '@/domain/Board';
import { RotationKind } from '@/domain/Cube';
import { GRID_SIZE, Position } from '@/domain/Position';
import { rankFor } from '@/domain/Score';
import { canGuess, maskedText, revealedCount } from '@/domain/SecretWord';
import { buildProductionDependencies } from '@/infrastructure/ProductionDependencies';
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
import { ObjectiveCard } from '@/ui/components/ObjectiveCard';
import { WordTrack } from '@/ui/components/WordTrack';
import { useBeforeUnloadWarning } from '@/ui/hooks/useBeforeUnloadWarning';
import { useGameMusic } from '@/ui/hooks/useGameMusic';
import { useSoloPlay } from '@/ui/hooks/useSoloPlay';
import { FiligreeDivider, OrnateFrame, ParchmentBackground } from '@/ui/ornaments';
import { colors, fonts, spacing } from '@/ui/styles/tokens';
import { describeDeclareResult, describePhase, rotationActions, TurnPhase } from '@/ui/turnFlow';

const dependencies = buildProductionDependencies();

const ROTATIONS = rotationActions('al maestro');

export default function SoloPlay() {
  const router = useRouter();
  const navigation = useNavigation();
  const confirm = useConfirm();
  const solo = useSoloPlay(dependencies);
  const { state } = solo;
  const [phase, setPhase] = useState<TurnPhase>('select-cube');
  const [selected, setSelected] = useState<Position | null>(null);
  const [touched, setTouched] = useState<Set<Position>>(new Set());
  const [guess, setGuess] = useState('');
  const [lastAnimation, setLastAnimation] = useState<{
    positions: ReadonlySet<Position>;
    kind: CubeAnimationKind;
  } | null>(null);
  const flash = useFlash();
  const autoDeclaredRef = useRef(false);

  const hasActiveGame = !state.finished;
  useBeforeUnloadWarning(hasActiveGame);
  useGameMusic(hasActiveGame);

  const goHome = useCallback(() => {
    router.dismissTo('/');
  }, [router]);

  const requestExit = useCallback(() => {
    if (!hasActiveGame) {
      goHome();
      return;
    }
    confirm({
      title: 'Salir del laboratorio',
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

  useEffect(() => {
    if (phase !== 'declare') {
      autoDeclaredRef.current = false;
      return;
    }
    if (autoDeclaredRef.current) return;
    if (!state.canDeclareThisTurn) return;
    autoDeclaredRef.current = true;
    const result = solo.declare();
    if (result.declared > 0) audio.play('objective');
    if (result.revealedCardIndices.length > 0) {
      setTimeout(() => audio.play('reveal'), result.declared > 0 ? 200 : 0);
    }
    const msg = describeDeclareResult(
      result.declared,
      result.released,
      result.revealedCardIndices.length
    );
    if (msg) flash.show(msg);
  }, [phase, state.canDeclareThisTurn, solo, flash.show]);

  const onPressCube = (i: Position) => {
    if (state.finished) return;
    if (state.board.lockedThisTurn.includes(i)) return;
    if (phase === 'declare') {
      flash.show('Ya has movido tus dos dados. Acaba el turno.');
      return;
    }

    if (phase === 'select-cube') {
      setSelected(i);
      setPhase('choose-action');
      return;
    }
    if (phase === 'choose-action') {
      if (selected === i) {
        setSelected(null);
        setPhase('select-cube');
      } else {
        setSelected(i);
      }
      return;
    }
    if (phase === 'select-second-cube') {
      if (selected === null) return;
      if (i === selected) {
        flash.show('Selecciona otro dado distinto');
        return;
      }
      const previous = selected;
      const applied = solo.swap(previous, i);
      if (!applied) {
        flash.show('Solo puedes intercambiar en la misma fila o columna');
        return;
      }
      audio.play('swap');
      setLastAnimation({ positions: new Set([previous, i]), kind: 'swap' });
      setTouched(new Set([previous, i]));
      setSelected(null);
      setPhase('declare');
    }
  };

  const onRotate = (kind: RotationKind) => {
    if (selected === null) return;
    const target = selected;
    solo.rotate(target, kind);
    audio.play(kind === 'spin-cw' || kind === 'spin-ccw' ? 'cube-spin' : 'cube-roll');
    setLastAnimation({ positions: new Set([target]), kind });
    const next = new Set(touched).add(target);
    setTouched(next);
    setSelected(null);
    setPhase(next.size >= TOUCHES_PER_TURN ? 'declare' : 'select-cube');
  };

  const onStartSwap = () => {
    if (selected === null) return;
    if (touched.size > 0) {
      flash.show('Para intercambiar, ha de ser tu única acción del turno');
      return;
    }
    setPhase('select-second-cube');
  };

  const onCancelAction = () => {
    setSelected(null);
    setPhase('select-cube');
  };

  const onEndTurn = () => {
    if (touched.size < TOUCHES_PER_TURN) {
      flash.show(`Hay que mover ${TOUCHES_PER_TURN} dados para acabar el turno`);
      return;
    }
    audio.play('turn-end');
    solo.finishTurn(Array.from(touched));
    setTouched(new Set());
    setSelected(null);
    setPhase('select-cube');
    setLastAnimation(null);
  };

  const onGuess = () => {
    if (guess.trim().length === 0) return;
    solo.guess(guess);
  };

  const onRestart = () => {
    solo.restart();
    setSelected(null);
    setTouched(new Set());
    setGuess('');
    setPhase('select-cube');
    setLastAnimation(null);
  };

  const rows = useMemo(() => {
    const r: number[][] = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      r.push([i * GRID_SIZE, i * GRID_SIZE + 1, i * GRID_SIZE + 2]);
    }
    return r;
  }, []);

  useEffect(() => {
    if (!state.finished) return;
    audio.play(state.outcome === 'won' ? 'win' : 'lose');
  }, [state.finished, state.outcome]);

  if (state.finished) {
    const score = state.finalScore ?? 0;
    const info = rankFor(score);
    const won = state.outcome === 'won';
    const fullWord = state.secretWord.cards.map((c) => c.letter).join('');
    return (
      <View style={styles.page}>
        <ParchmentBackground />
        <EndScreen
          won={won}
          word={fullWord}
          onRestart={onRestart}
          onHome={() => router.dismissTo('/')}
        >
          <View style={styles.endStats}>
            <Text style={styles.endStat}>Turnos: {state.turn}</Text>
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

  const guessEligible = canGuess(state.secretWord);
  const phaseHint = describePhase(phase, touched.size);
  const myBlocked = state.objectives.filter((s) => s.blockedBy !== null);
  const availableSlots = state.objectives.filter((s) => s.blockedBy === null);

  return (
    <View style={styles.page}>
      <ParchmentBackground />
      <ScrollView contentContainerStyle={styles.container}>
      <NewGameButton onConfirm={onRestart} />

      <View style={styles.headerRow}>
        <Stat label="Turno" value={String(state.turn + 1)} />
        <Stat label="Reveladas" value={`${revealedCount(state.secretWord)} / 6`} />
        <Stat
          label="Tocados"
          value={`${touched.size} / ${TOUCHES_PER_TURN}`}
        />
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
            onPress={() => setPhase('choose-action')}
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

      {guessEligible && (
        <GuessBox
          value={guess}
          onChangeText={setGuess}
          onSubmit={onGuess}
          hint={`Tienes ${revealedCount(state.secretWord)} letras. Puedes intentar adivinar la palabra del maestro.`}
        />
      )}

      <Footer />

      <FlashMessage message={flash.message} />
      </ScrollView>
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
  grid: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  gridRow: {
    flexDirection: 'row',
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
