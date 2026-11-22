import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Footer } from '@/ui/components/Footer';
import { RulesBook } from '@/ui/components/RulesBook';
import { FiligreeDivider, Ouroboros, ParchmentBackground } from '@/ui/ornaments';
import { colors, fonts, spacing } from '@/ui/styles/tokens';

export default function Instructions() {
  return (
    <View style={styles.page}>
      <ParchmentBackground />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <Ouroboros size={84} color={colors.text} accent={colors.gold} />
          <Text style={styles.heroTitle}>Tria Prima</Text>
          <Text style={styles.heroSubtitle}>Reglas del cifrado</Text>
          <View style={styles.heroRule}>
            <FiligreeDivider width={180} variant="fleuron" />
          </View>
        </View>

        <RulesBook />

        <View style={styles.flourish}>
          <FiligreeDivider width={180} variant="fleuron" />
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
    padding: 20,
    paddingBottom: 60,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 16,
  },
  heroTitle: {
    fontFamily: fonts.serif,
    color: colors.accent,
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: 3,
    marginTop: spacing.md,
  },
  heroSubtitle: {
    fontFamily: fonts.serif,
    color: colors.textMuted,
    fontSize: 15,
    fontStyle: 'italic',
    marginTop: 4,
  },
  heroRule: {
    marginTop: 14,
  },
  flourish: {
    alignItems: 'center',
    marginTop: 8,
  },
});
