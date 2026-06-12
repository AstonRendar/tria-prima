import { useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { FirstPlayerChoice, MatchSetup } from '@/application/StartMatch';
import { isValidSecretWord, normalizeGuess, WORD_LENGTH } from '@/domain/SecretWord';
import { ActionButton } from './ActionButton';
import { Footer } from './Footer';
import { colors, fonts, radius, spacing } from '@/ui/styles/tokens';

type Props = {
  onStart: (setup: MatchSetup) => void;
};

type Step = 'names' | 'p1-handoff' | 'p1-word' | 'p2-handoff' | 'p2-word';

export function SetupScreen({ onStart }: Props) {
  const [step, setStep] = useState<Step>('names');
  const [p1Name, setP1Name] = useState('');
  const [p2Name, setP2Name] = useState('');
  const [p1Word, setP1Word] = useState('');
  const [p2Word, setP2Word] = useState('');
  const [firstPlayer, setFirstPlayer] = useState<FirstPlayerChoice>('random');

  const namesValid = p1Name.trim().length > 0 && p2Name.trim().length > 0;

  const confirmNames = () => {
    if (!namesValid) return;
    setStep('p1-handoff');
  };

  const confirmP1Word = () => {
    if (!isValidSecretWord(p1Word)) return;
    setStep('p2-handoff');
  };

  const confirmP2Word = () => {
    if (!isValidSecretWord(p2Word)) return;
    onStart({
      p1Name: p1Name.trim(),
      p2Name: p2Name.trim(),
      p1Word: normalizeGuess(p1Word),
      p2Word: normalizeGuess(p2Word),
      firstPlayer,
    });
  };

  if (step === 'names') {
    return (
      <NamesStep
        p1={p1Name}
        p2={p2Name}
        onChangeP1={setP1Name}
        onChangeP2={setP2Name}
        firstPlayer={firstPlayer}
        onChangeFirstPlayer={setFirstPlayer}
        valid={namesValid}
        onContinue={confirmNames}
      />
    );
  }

  if (step === 'p1-handoff') {
    return (
      <Handoff
        title="Es el turno de"
        name={p1Name.trim()}
        message="Coge el dispositivo. Tendrás que escribir tu palabra secreta en privado."
        onContinue={() => setStep('p1-word')}
      />
    );
  }

  if (step === 'p1-word') {
    return (
      <WordStep
        playerName={p1Name.trim()}
        value={p1Word}
        onChange={setP1Word}
        onContinue={confirmP1Word}
      />
    );
  }

  if (step === 'p2-handoff') {
    return (
      <Handoff
        title="Pasa el dispositivo a"
        name={p2Name.trim()}
        message="No mires la pantalla mientras tu rival escribe su palabra."
        onContinue={() => setStep('p2-word')}
      />
    );
  }

  return (
    <WordStep
      playerName={p2Name.trim()}
      value={p2Word}
      onChange={setP2Word}
      onContinue={confirmP2Word}
    />
  );
}

function NamesStep({
  p1,
  p2,
  onChangeP1,
  onChangeP2,
  firstPlayer,
  onChangeFirstPlayer,
  valid,
  onContinue,
}: {
  p1: string;
  p2: string;
  onChangeP1: (s: string) => void;
  onChangeP2: (s: string) => void;
  firstPlayer: FirstPlayerChoice;
  onChangeFirstPlayer: (choice: FirstPlayerChoice) => void;
  valid: boolean;
  onContinue: () => void;
}) {
  const p2Ref = useRef<TextInput>(null);

  const onSubmitP1 = () => {
    if (p1.trim().length > 0) p2Ref.current?.focus();
  };

  const onSubmitP2 = () => {
    if (valid) onContinue();
  };

  return (
    <ScrollView contentContainerStyle={styles.container} style={styles.page}>
      <Text style={styles.flourish}>⚜</Text>
      <Text style={styles.title}>Aprendices de Paracelso</Text>
      <Text style={styles.subtitle}>Indicad vuestros nombres antes de comenzar la Obra.</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Aprendiz 1</Text>
        <TextInput
          value={p1}
          onChangeText={onChangeP1}
          placeholder="Nombre del primer aprendiz"
          placeholderTextColor={colors.textMuted}
          maxLength={24}
          autoFocus
          returnKeyType="next"
          onSubmitEditing={onSubmitP1}
          blurOnSubmit={false}
          style={styles.input}
          testID="setup/p1"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Aprendiz 2</Text>
        <TextInput
          ref={p2Ref}
          value={p2}
          onChangeText={onChangeP2}
          placeholder="Nombre del segundo aprendiz"
          placeholderTextColor={colors.textMuted}
          maxLength={24}
          returnKeyType="done"
          onSubmitEditing={onSubmitP2}
          style={styles.input}
          testID="setup/p2"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>¿Quién empieza?</Text>
        <View style={styles.firstPlayerRow}>
          <ActionButton
            label={p1.trim() || 'Aprendiz 1'}
            variant={firstPlayer === 'p1' ? 'primary' : 'secondary'}
            onPress={() => onChangeFirstPlayer('p1')}
            testID="setup/first-p1"
          />
          <ActionButton
            label={p2.trim() || 'Aprendiz 2'}
            variant={firstPlayer === 'p2' ? 'primary' : 'secondary'}
            onPress={() => onChangeFirstPlayer('p2')}
            testID="setup/first-p2"
          />
          <ActionButton
            label="Al azar"
            variant={firstPlayer === 'random' ? 'primary' : 'secondary'}
            onPress={() => onChangeFirstPlayer('random')}
            testID="setup/first-random"
          />
        </View>
      </View>

      <View style={styles.action}>
        <ActionButton
          label="Continuar"
          variant="primary"
          onPress={onContinue}
          disabled={!valid}
          testID="setup/continue-names"
        />
      </View>

      <Footer />
    </ScrollView>
  );
}

function Handoff({
  title,
  name,
  message,
  onContinue,
}: {
  title: string;
  name: string;
  message: string;
  onContinue: () => void;
}) {
  return (
    <View style={[styles.page, styles.centered]}>
      <View style={styles.handoffBox}>
        <Text style={styles.handoffTitle}>{title}</Text>
        <Text style={styles.handoffName}>{name}</Text>
        <Text style={styles.handoffBody}>{message}</Text>
        <ActionButton
          label="Estoy listo"
          variant="primary"
          onPress={onContinue}
          testID="setup/handoff-continue"
        />
      </View>
    </View>
  );
}

function WordStep({
  playerName,
  value,
  onChange,
  onContinue,
}: {
  playerName: string;
  value: string;
  onChange: (s: string) => void;
  onContinue: () => void;
}) {
  const normalized = normalizeGuess(value);
  const valid = normalized.length === WORD_LENGTH;
  const tooLong = normalized.length > WORD_LENGTH;
  return (
    <ScrollView contentContainerStyle={styles.container} style={styles.page}>
      <Text style={styles.flourish}>⚜</Text>
      <Text style={styles.title}>{playerName}</Text>
      <Text style={styles.subtitle}>
        Escribe tu palabra clave. Solo tú debes verla.
      </Text>

      <View style={styles.field}>
        <Text style={styles.label}>Palabra clave (6 letras)</Text>
        <TextInput
          value={value}
          onChangeText={(text) => onChange(text.toUpperCase())}
          placeholder="ESCRIBE AQUI"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="characters"
          autoCorrect={false}
          secureTextEntry
          autoFocus
          maxLength={12}
          returnKeyType="done"
          onSubmitEditing={valid ? onContinue : undefined}
          style={styles.input}
          testID="setup/word"
        />
        <Text style={styles.hint}>
          {tooLong
            ? `Demasiado larga: solo ${WORD_LENGTH} letras (sin acentos ni espacios).`
            : `Sustantivo común singular. Letras útiles: ${normalized.length} / ${WORD_LENGTH}.`}
        </Text>
      </View>

      <View style={styles.action}>
        <ActionButton
          label="Confirmar palabra"
          variant="primary"
          onPress={onContinue}
          disabled={!valid}
          testID="setup/word-continue"
        />
      </View>

      <Footer />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.background,
    flex: 1,
  },
  container: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
    alignItems: 'center',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  flourish: {
    color: colors.danger,
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  title: {
    fontFamily: fonts.serif,
    color: colors.accent,
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtitle: {
    fontFamily: fonts.serif,
    color: colors.textMuted,
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  field: {
    width: '100%',
    maxWidth: 360,
    marginBottom: spacing.lg,
  },
  label: {
    fontFamily: fonts.serif,
    color: colors.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  input: {
    fontFamily: fonts.serif,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    color: colors.text,
    fontSize: 16,
    letterSpacing: 2,
  },
  hint: {
    fontFamily: fonts.serif,
    color: colors.textMuted,
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  action: {
    width: '100%',
    maxWidth: 360,
    marginTop: spacing.md,
  },
  firstPlayerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    rowGap: spacing.xs,
  },
  handoffBox: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
  },
  handoffTitle: {
    fontFamily: fonts.serif,
    color: colors.textMuted,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  handoffName: {
    fontFamily: fonts.serif,
    color: colors.accent,
    fontSize: 28,
    fontWeight: '800',
    marginVertical: spacing.sm,
    textAlign: 'center',
  },
  handoffBody: {
    fontFamily: fonts.serif,
    color: colors.text,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
});
