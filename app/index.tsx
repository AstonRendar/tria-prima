import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { ActionButton } from '@/ui/components/ActionButton';
import { Footer } from '@/ui/components/Footer';
import { colors, fonts, spacing } from '@/ui/styles/tokens';

export default function Home() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.flourish}>⚜</Text>
      <Text style={styles.title}>Tria Prima</Text>
      <Text style={styles.subtitle}>
        Bajo la mirada de Paracelso, descifra la palabra del rival antes que él la tuya.
      </Text>
      <View style={styles.rule} />
      <View style={styles.actions}>
        <ActionButton
          label="Duelo a dos"
          variant="primary"
          onPress={() => router.push('/play')}
          testID="home/play"
        />
        <View style={{ height: spacing.md }} />
        <ActionButton
          label="Contra el maestro"
          onPress={() => router.push('/versus')}
          testID="home/versus"
        />
        <View style={{ height: spacing.md }} />
        <ActionButton
          label="Desafío"
          onPress={() => router.push('/solo')}
          testID="home/solo"
        />
        <View style={{ height: spacing.md }} />
        <ActionButton
          label="Con el juego físico"
          onPress={() => router.push('/tracker')}
          testID="home/tracker"
        />
        <View style={{ height: spacing.md }} />
        <ActionButton
          label="Reglas del cifrado"
          onPress={() => router.push('/instructions')}
          testID="home/instructions"
        />
      </View>
      <View style={styles.footerWrap}>
        <Footer />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  flourish: {
    fontFamily: fonts.serif,
    color: colors.danger,
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  title: {
    fontFamily: fonts.serif,
    color: colors.accent,
    fontSize: 52,
    fontWeight: '800',
    letterSpacing: 4,
  },
  subtitle: {
    fontFamily: fonts.serif,
    color: colors.textMuted,
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: spacing.md,
  },
  rule: {
    width: 120,
    height: 1,
    backgroundColor: colors.parchmentDark,
    marginVertical: spacing.xl,
  },
  actions: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'stretch',
  },
  footerWrap: {
    position: 'absolute',
    bottom: spacing.sm,
    left: 0,
    right: 0,
  },
});
