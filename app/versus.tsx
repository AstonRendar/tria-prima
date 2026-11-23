import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import { AppLevel } from '@/application/AppOpponent';
import { FirstPlayerChoice } from '@/application/StartMatch';
import { APP_PLAYER_NAME } from '@/application/StartVersus';
import { Position } from '@/domain/Position';
import {
  isValidSecretWord,
  normalizeGuess,
  plainText,
  revealedCount,
  WORD_LENGTH,
} from '@/domain/SecretWord';
import { buildProductionDependencies } from '@/infrastructure/ProductionDependencies';
import { audio } from '@/ui/audio/sound';
import { ActionButton } from '@/ui/components/ActionButton';
import { CubeGrid } from '@/ui/components/CubeGrid';
import { EndScreen } from '@/ui/components/EndScreen';
import { FlashMessage, useFlash } from '@/ui/components/FlashMessage';
import { Footer } from '@/ui/components/Footer';
import { GuessSheet } from '@/ui/components/GuessSheet';
import { HeaderBackButton } from '@/ui/components/HeaderBackButton';
import { ObjectiveRail } from '@/ui/components/ObjectiveRail';
import { SignCounters } from '@/ui/components/SignCounters';
import { TurnActions } from '@/ui/components/TurnActions';
import { WordTrack } from '@/ui/components/WordTrack';
import { useExitGuard } from '@/ui/hooks/useExitGuard';
import { useGameMusic } from '@/ui/hooks/useGameMusic';
import { CubeAnimation, rotationSfx, useTurnController } from '@/ui/hooks/useTurnController';
import { useVersus } from '@/ui/hooks/useVersus';
import { FiligreeDivider, ParchmentBackground } from '@/ui/ornaments';
import { colors, fonts, radius, spacing } from '@/ui/styles/tokens';
import { describePhase } from '@/ui/turnFlow';
import { gameTourSteps } from '@/ui/tutorial/tourSteps';
import { TourOverlay } from '@/ui/tutorial/TourOverlay';
import { TourTarget } from '@/ui/tutorial/TourTargets';
import { TutorialTip } from '@/ui/tutorial/TutorialTip';
import { useTour } from '@/ui/tutorial/useTour';
import { useTutorial } from '@/ui/tutorial/useTutorial';

const dependencies = buildProductionDependencies();
const TOUR_STEPS = gameTourSteps('versus');

export default function Versus() {
  const router = useRouter();
  const navigation = useNavigation();
  const versus = useVersus(dependencies);
  const { state } = versus;
  const [guessOpen, setGuessOpen] = useState(false);
  const flash = useFlash();

  const hasActiveGame = state !== null && !state.finished;
  useExitGuard(hasActiveGame, 'Abandonar el duelo');
  useGameMusic(hasActiveGame);

  const goHome = useCallback(() => {
    router.dismissTo('/');
  }, [router]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => <HeaderBackButton onPress={goHome} />,
    });
  }, [navigation, goHome]);

  const isMyTurn = hasActiveGame && state.currentPlayerId === 'p1';

  const turnCtl = useTurnController({
    port: versus,
    locked: state?.board.lockedThisTurn ?? [],
    canDeclare: state?.canDeclareThisTurn ?? false,
    enabled: isMyTurn,
    showMessage: flash.show,
  });

  const tour = useTour('game', TOUR_STEPS, isMyTurn);
  const tutorial = useTutorial(
    hasActiveGame && !tour.active
      ? {
          isMyTurn,
          phase: turnCtl.turn.phase,
          touchedCount: turnCtl.turn.touched.size,
          hasLockedCubes: state.board.lockedThisTurn.length > 0,
          anyMarker: state.players.p2.secretWord.cards.some((c) => c.markers > 0 || c.revealed),
          canGuess: versus.canGuessNow,
        }
      : null
  );

  // Las jugadas de la app se narran según llegan. La selección y la animación
  // se derivan del paso en el propio render: así CubeView recibe el
  // animationKind en el mismo commit en que cambia el tablero y el giro se ve
  // igual que cuando mueve el humano.
  const lastStep = versus.lastAppStep;
  const appSelected: Position[] = versus.appSelection;
  const appAnimation: CubeAnimation | null =
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
      audio.play(lastStep.action.kind === 'swap' ? 'swap' : rotationSfx(lastStep.action.rotation));
      flash.show('El maestro mueve…');
    }
    if (lastStep.kind === 'declare') {
      flash.show('El maestro declara sus objetivos');
    }
    if (lastStep.kind === 'guess') {
      flash.show(`El maestro intenta adivinar: ${lastStep.input}`);
    }
    if (lastStep.kind === 'end-turn') {
      audio.play('turn-end');
      flash.show('Tu turno');
    }
  }, [lastStep, flash.show]);

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

  const { turn } = turnCtl;

  const onEndTurn = () => turnCtl.onEndTurn();

  const onRestart = () => {
    versus.restart();
    turnCtl.reset();
    setGuessOpen(false);
  };

  if (state.finished) {
    const won = state.outcome === 'p1-wins';
    return (
      <View style={styles.page}>
        <ParchmentBackground />
        <EndScreen won={won} word={plainText(state.players.p2.secretWord)} onRestart={onRestart} onHome={goHome}>
          <View style={styles.endStats}>
            <Text style={styles.endStat}>{endMessage(won, state.failedGuessBy !== null)}</Text>
          </View>
        </EndScreen>
      </View>
    );
  }

  const opponent = state.players.p2;
  const animation = appAnimation ?? turnCtl.animation;
  const firstTurn = state.turn === 0;
  const hint = isMyTurn
    ? describePhase(turn.phase, turn.touched.size, firstTurn)
    : 'El maestro juega… espera a que termine sus movimientos.';

  return (
    <View style={styles.page}>
      <ParchmentBackground />
      <View style={styles.main}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.topRow}>
            <Text style={styles.turnBadge} numberOfLines={1} testID="versus/turn">
              {isMyTurn ? (
                <>
                  <Text style={styles.turnBadgeName}>Tu</Text> turno
                </>
              ) : (
                <>
                  Turno del <Text style={styles.turnBadgeName}>maestro</Text>
                </>
              )}
            </Text>
          </View>

          <Text style={styles.sectionLabel}>Palabra del maestro</Text>
          <TourTarget id="word">
            <WordTrack word={opponent.secretWord} compact />
          </TourTarget>

          <View style={styles.boardRow}>
            <TourTarget id="board">
              <CubeGrid
                board={state.board}
                selected={isMyTurn ? (turn.selected === null ? [] : [turn.selected]) : appSelected}
                touched={turn.touched}
                animation={animation}
                onPress={isMyTurn ? turnCtl.onPressCube : undefined}
              />
            </TourTarget>
            <TourTarget id="objectives">
              <ObjectiveRail
                slots={state.objectives}
                ownerOf={(slot) => (slot.blockedBy === null ? 'free' : slot.blockedBy === 'p1' ? 'mine' : 'rival')}
              />
            </TourTarget>
          </View>

          <TourTarget id="my-word" style={styles.myRow}>
            <Text style={styles.sectionLabel}>Tu palabra</Text>
            <SignCounters word={state.players.p1.secretWord} />
          </TourTarget>
        </ScrollView>
        {!isMyTurn && <View style={styles.masterVeil} testID="versus/master-veil" />}
      </View>

      <TourTarget id="actions">
        <TurnActions
          phase={turn.phase}
          hint={hint}
          hintTestID={isMyTurn && firstTurn ? 'first-turn-notice' : undefined}
          enabled={isMyTurn}
          onRotate={turnCtl.onRotate}
          onStartSwap={turnCtl.onStartSwap}
          onCancelAction={turnCtl.onCancelAction}
          onCancelSwap={turnCtl.onCancelSwap}
          onEndTurn={onEndTurn}
          onGuess={versus.canGuessNow ? () => setGuessOpen(true) : undefined}
        />
      </TourTarget>

      <GuessSheet
        visible={guessOpen && versus.canGuessNow}
        hint={`Acabas de descubrir una letra y tienes ${revealedCount(opponent.secretWord)} del maestro. Solo hay un intento.`}
        onClose={() => setGuessOpen(false)}
        onSubmit={(value) => {
          setGuessOpen(false);
          versus.guess(value);
        }}
      />
      <TourOverlay
        step={tour.step}
        index={tour.index}
        total={tour.total}
        onNext={tour.next}
        onSkip={tour.skip}
      />
      <TutorialTip step={tutorial.step} onDismiss={tutorial.dismiss} onSkip={tutorial.skip} />
      <FlashMessage message={flash.message} />
    </View>
  );
}

function endMessage(won: boolean, failedGuess: boolean): string {
  if (won) return failedGuess ? 'El maestro falló al adivinar tu palabra' : 'Has vencido al maestro';
  return failedGuess ? 'Fallaste al adivinar su palabra' : 'El maestro descifró tu palabra antes';
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
  const valid = isValidSecretWord(word);
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
          placeholder="ESCRIBE AQUÍ"
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
        <Text style={[styles.setupHint, !valid && styles.setupHintInvalid]}>
          {tooLong
            ? `Demasiado larga: solo ${WORD_LENGTH} letras (sin acentos ni espacios).`
            : normalized.length === WORD_LENGTH && !valid
            ? 'Solo letras: sin números ni signos.'
            : `Sustantivo común, en singular o plural. Letras útiles: ${normalized.length} / ${WORD_LENGTH}.`}
        </Text>
      </View>
      <View style={styles.setupField}>
        <Text style={styles.setupLabel}>Nivel del alquimista</Text>
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
            : 'Juega siempre su mejor jugada y arriesga en cuanto tiene cinco letras.'}
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
    alignItems: 'flex-start',
    marginTop: spacing.md,
  },
  myRow: {
    marginTop: spacing.md,
  },
  masterVeil: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 20, 33, 0.25)',
    zIndex: 25,
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
  setupHintInvalid: {
    color: colors.danger,
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
