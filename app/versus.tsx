import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import { AppLevel } from '@/application/AppOpponent';
import { FirstPlayerChoice } from '@/application/StartMatch';
import { APP_PLAYER_NAME } from '@/application/StartVersus';
import { TOUCHES_PER_TURN } from '@/domain/Board';
import { RotationKind } from '@/domain/Cube';
import { GRID_SIZE, Position } from '@/domain/Position';
import { canGuess, maskedText, normalizeGuess, revealedCount, WORD_LENGTH } from '@/domain/SecretWord';
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
import { ObjectiveBlockedZone } from '@/ui/components/ObjectiveBlockedZone';
import { ObjectiveCard } from '@/ui/components/ObjectiveCard';
import { SignCounters } from '@/ui/components/SignCounters';
import { WordTrack } from '@/ui/components/WordTrack';
import { useBeforeUnloadWarning } from '@/ui/hooks/useBeforeUnloadWarning';
import { useGameMusic } from '@/ui/hooks/useGameMusic';
import { useVersus } from '@/ui/hooks/useVersus';
import { FiligreeDivider, OrnateFrame, ParchmentBackground } from '@/ui/ornaments';
import { colors, fonts, radius, spacing } from '@/ui/styles/tokens';
import { describeDeclareResult, describePhase, rotationActions, TurnPhase } from '@/ui/turnFlow';

const dependencies = buildProductionDependencies();

const ROTATIONS = rotationActions('al maestro');

export default function Versus() {
  const router = useRouter();
  const navigation = useNavigation();
  const confirm = useConfirm();
  const versus = useVersus(dependencies);
  const { state } = versus;
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

  const hasActiveGame = state !== null && !state.finished;
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
      title: 'Abandonar el duelo',
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

  const isMyTurn = state !== null && !state.finished && state.currentPlayerId === 'p1';

  // Las jugadas de la app se narran según llegan. La selección y la animación
  // se derivan del paso en el propio render: así CubeView recibe el
  // animationKind en el mismo commit en que cambia el tablero y el giro se ve
  // igual que cuando mueve el humano.
  const lastStep = versus.lastAppStep;
  const appSelected = lastStep?.kind === 'select' ? lastStep.position : null;
  const appAnimation: { positions: ReadonlySet<Position>; kind: CubeAnimationKind } | null =
    lastStep?.kind === 'action'
      ? lastStep.action.kind === 'swap'
        ? { positions: new Set([lastStep.action.a, lastStep.action.b]), kind: 'swap' }
        : { positions: new Set([lastStep.action.position]), kind: lastStep.action.rotation }
      : null;
  useEffect(() => {
    if (!lastStep) return;
    if (lastStep.kind === 'select') {
      flash.show('El maestro escoge un dado…');
    }
    if (lastStep.kind === 'action') {
      if (lastStep.action.kind === 'swap') {
        audio.play('swap');
      } else {
        const r = lastStep.action.rotation;
        audio.play(r === 'spin-cw' || r === 'spin-ccw' ? 'cube-spin' : 'cube-roll');
      }
      flash.show('El maestro mueve…');
    }
    if (lastStep.kind === 'declare') {
      flash.show('El maestro declara sus objetivos');
    }
    if (lastStep.kind === 'end-turn') {
      audio.play('turn-end');
      flash.show('Tu turno');
    }
  }, [lastStep, flash.show]);

  // Al cerrar la fase de movimiento del humano, declara automáticamente.
  useEffect(() => {
    if (phase !== 'declare') {
      autoDeclaredRef.current = false;
      return;
    }
    if (autoDeclaredRef.current) return;
    if (!state || !state.canDeclareThisTurn || !isMyTurn) return;
    autoDeclaredRef.current = true;
    const result = versus.declare();
    if (result.declared > 0) audio.play('objective');
    if (result.revealedCardIndices.length > 0) {
      setTimeout(() => audio.play('reveal'), result.declared > 0 ? 200 : 0);
    }
    const msg = describeDeclareResult(result.declared, result.released, result.revealedCardIndices.length);
    if (msg) flash.show(msg);
  }, [phase, state, isMyTurn, versus, flash.show]);

  const rows = useMemo(() => {
    const r: number[][] = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      r.push([i * GRID_SIZE, i * GRID_SIZE + 1, i * GRID_SIZE + 2]);
    }
    return r;
  }, []);

  useEffect(() => {
    if (!state?.finished) return;
    audio.play(state.outcome === 'p1-wins' ? 'win' : 'lose');
  }, [state?.finished, state?.outcome]);

  if (!state) {
    return (
      <VersusSetup
        onStart={(word, level, firstPlayer) =>
          versus.start({ playerName: 'Tú', playerWord: word, level, firstPlayer })
        }
      />
    );
  }

  const onPressCube = (i: Position) => {
    if (state.finished || !isMyTurn) return;
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
      const applied = versus.swap(previous, i);
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
    versus.rotate(target, kind);
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
    versus.finishTurn(Array.from(touched));
    setTouched(new Set());
    setSelected(null);
    setPhase('select-cube');
    setLastAnimation(null);
  };

  const onGuess = () => {
    if (guess.trim().length === 0) return;
    versus.guess(guess);
  };

  const onRestart = () => {
    versus.restart();
    setSelected(null);
    setTouched(new Set());
    setGuess('');
    setPhase('select-cube');
    setLastAnimation(null);
  };

  if (state.finished) {
    const won = state.outcome === 'p1-wins';
    const appWord = state.players.p2.secretWord.cards.map((c) => c.letter).join('');
    return (
      <View style={styles.page}>
        <ParchmentBackground />
        <EndScreen won={won} word={appWord} onRestart={onRestart} onHome={goHome}>
          <View style={styles.endStats}>
            <Text style={styles.endStat}>
              {won ? 'Has vencido al maestro' : 'El maestro descifró tu palabra antes'}
            </Text>
          </View>
        </EndScreen>
      </View>
    );
  }

  const opponent = state.players.p2;
  const animation = appAnimation ?? lastAnimation;
  const guessEligible = isMyTurn && canGuess(opponent.secretWord);
  const phaseHint = isMyTurn
    ? describePhase(phase, touched.size)
    : 'El maestro estudia el tablero…';
  const mySlots = state.objectives.filter((s) => s.blockedBy === 'p1');
  const opponentSlots = state.objectives.filter((s) => s.blockedBy === 'p2');
  const availableSlots = state.objectives.filter((s) => s.blockedBy === null);

  return (
    <View style={styles.page}>
      <ParchmentBackground />
      <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.topRow}>
        <NewGameButton onConfirm={onRestart} />
        <View style={[styles.turnBadge, !isMyTurn && styles.turnBadgeApp]}>
          <Text style={styles.turnBadgeLabel}>Turno de</Text>
          <Text style={styles.turnBadgeName} numberOfLines={1} testID="versus/turn-name">
            {isMyTurn ? 'Tú' : APP_PLAYER_NAME}
          </Text>
        </View>
      </View>

      <ObjectiveBlockedZone
        playerName={`Bloqueados de ${APP_PLAYER_NAME}`}
        slots={opponentSlots}
        testID="blocked/opponent"
      />

      <Text style={styles.opponentLine}>Palabra de {APP_PLAYER_NAME}</Text>
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
                  selected={selected === i || appSelected === i}
                  locked={state.board.lockedThisTurn.includes(i)}
                  touched={touched.has(i)}
                  animationKind={animation?.positions.has(i) ? animation.kind : null}
                  onPress={isMyTurn ? () => onPressCube(i) : undefined}
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

      {isMyTurn && phase === 'choose-action' && (
        <View style={styles.actionPanel}>
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
        </View>
      )}

      {isMyTurn && phase === 'select-second-cube' && (
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

      {isMyTurn && phase === 'declare' && (
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
      <ObjectiveBlockedZone playerName="Tus bloqueados" slots={mySlots} testID="blocked/me" />
      <Text style={[styles.opponentLine, styles.myWordLine]}>Tu palabra</Text>
      <SignCounters word={state.players.p1.secretWord} />

      {guessEligible && (
        <GuessBox
          value={guess}
          onChangeText={setGuess}
          onSubmit={onGuess}
          hint={`Tienes ${revealedCount(opponent.secretWord)} letras del maestro. Puedes intentar adivinar.`}
        />
      )}

      <Footer />

      <FlashMessage message={flash.message} />
      </ScrollView>
    </View>
  );
}

function VersusSetup({
  onStart,
}: {
  onStart: (word: string, level: AppLevel, firstPlayer: FirstPlayerChoice) => void;
}) {
  const [word, setWord] = useState('');
  const [level, setLevel] = useState<AppLevel>('apprentice');
  const [firstPlayer, setFirstPlayer] = useState<FirstPlayerChoice>('random');
  const normalized = normalizeGuess(word);
  const valid = normalized.length === WORD_LENGTH;
  const tooLong = normalized.length > WORD_LENGTH;
  return (
    <View style={styles.page}>
      <ParchmentBackground />
      <ScrollView contentContainerStyle={styles.setupContainer}>
      <View style={styles.setupFlourish}>
        <FiligreeDivider width={160} variant="fleuron" />
      </View>
      <Text style={styles.setupTitle}>Contra el maestro</Text>
      <Text style={styles.setupSubtitle}>
        El maestro esconderá una palabra y moverá los dados por su cuenta. Escribe la tuya:
        él intentará descifrarla.
      </Text>
      <View style={styles.setupField}>
        <Text style={styles.setupLabel}>Tu palabra clave (6 letras)</Text>
        <TextInput
          value={word}
          onChangeText={(text) => setWord(text.toUpperCase())}
          placeholder="ESCRIBE AQUI"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="characters"
          autoCorrect={false}
          autoFocus
          maxLength={12}
          returnKeyType="done"
          onSubmitEditing={valid ? () => onStart(normalized, level, firstPlayer) : undefined}
          style={styles.setupInput}
          testID="setup/word"
        />
        <Text style={styles.setupHint}>
          {tooLong
            ? `Demasiado larga: solo ${WORD_LENGTH} letras (sin acentos ni espacios).`
            : `Sustantivo común singular. Letras útiles: ${normalized.length} / ${WORD_LENGTH}.`}
        </Text>
      </View>
      <View style={styles.setupField}>
        <Text style={styles.setupLabel}>Nivel del maestro</Text>
        <View style={styles.levelRow}>
          <ActionButton
            label="Aprendiz"
            variant={level === 'apprentice' ? 'primary' : 'secondary'}
            onPress={() => setLevel('apprentice')}
            testID="setup/level-apprentice"
          />
          <ActionButton
            label="Maestro"
            variant={level === 'master' ? 'primary' : 'secondary'}
            onPress={() => setLevel('master')}
            testID="setup/level-master"
          />
        </View>
        <Text style={styles.setupHint}>
          {level === 'apprentice'
            ? 'Se despista a menudo y solo arriesga adivinanzas casi seguras.'
            : 'Juega siempre su mejor jugada y arriesga en cuanto puede.'}
        </Text>
      </View>
      <View style={styles.setupField}>
        <Text style={styles.setupLabel}>¿Quién empieza?</Text>
        <View style={styles.levelRow}>
          <ActionButton
            label="Tú"
            variant={firstPlayer === 'p1' ? 'primary' : 'secondary'}
            onPress={() => setFirstPlayer('p1')}
            testID="setup/first-p1"
          />
          <ActionButton
            label={APP_PLAYER_NAME}
            variant={firstPlayer === 'p2' ? 'primary' : 'secondary'}
            onPress={() => setFirstPlayer('p2')}
            testID="setup/first-p2"
          />
          <ActionButton
            label="Al azar"
            variant={firstPlayer === 'random' ? 'primary' : 'secondary'}
            onPress={() => setFirstPlayer('random')}
            testID="setup/first-random"
          />
        </View>
      </View>
      <View style={styles.setupAction}>
        <ActionButton
          label="Empezar el duelo"
          variant="primary"
          onPress={() => onStart(normalized, level, firstPlayer)}
          disabled={!valid}
          testID="setup/start"
        />
      </View>
      <Footer />
      </ScrollView>
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
    maxWidth: '55%',
  },
  turnBadgeApp: {
    opacity: 0.85,
  },
  turnBadgeLabel: {
    fontFamily: fonts.serif,
    color: colors.textMuted,
    fontSize: 12,
  },
  turnBadgeName: {
    fontFamily: fonts.serif,
    color: colors.accent,
    fontSize: 18,
    fontWeight: '700',
  },
  opponentLine: {
    fontFamily: fonts.serif,
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  myWordLine: {
    marginTop: spacing.lg,
  },
  maskedWord: {
    fontFamily: fonts.serif,
    color: colors.text,
    fontSize: 28,
    letterSpacing: 6,
    textAlign: 'center',
    fontWeight: '700',
  },
  firstTurnNotice: {
    fontFamily: fonts.serif,
    color: colors.danger,
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  phaseHint: {
    fontFamily: fonts.serif,
    color: colors.textMuted,
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: spacing.md,
  },
  boardRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  grid: {
    alignItems: 'center',
  },
  gridRow: {
    flexDirection: 'row',
  },
  availableColumn: {
    marginLeft: spacing.md,
    alignItems: 'center',
  },
  availableTitle: {
    fontFamily: fonts.serif,
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  empty: {
    fontFamily: fonts.serif,
    color: colors.textMuted,
    fontSize: 18,
  },
  actionPanel: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  actionBtn: {
    marginVertical: spacing.xs,
  },
  actionRow: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  swapNotice: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  swapText: {
    fontFamily: fonts.serif,
    color: colors.text,
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  endStats: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  endStat: {
    fontFamily: fonts.serif,
    color: colors.textMuted,
    fontSize: 15,
  },
  setupContainer: {
    flexGrow: 1,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setupFlourish: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  setupTitle: {
    fontFamily: fonts.serif,
    color: colors.accent,
    fontSize: 30,
    fontWeight: '800',
  },
  setupSubtitle: {
    fontFamily: fonts.serif,
    color: colors.textMuted,
    fontSize: 15,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: spacing.md,
    maxWidth: 420,
  },
  setupField: {
    width: '100%',
    maxWidth: 360,
    marginTop: spacing.xl,
  },
  setupLabel: {
    fontFamily: fonts.serif,
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  setupInput: {
    fontFamily: fonts.serif,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 18,
    letterSpacing: 4,
    color: colors.text,
  },
  setupHint: {
    fontFamily: fonts.serif,
    color: colors.textMuted,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  setupAction: {
    marginTop: spacing.lg,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  levelRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    rowGap: spacing.xs,
  },
});
