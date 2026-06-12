import { Linking, StyleSheet, Text, View } from 'react-native';
import { FiligreeDivider } from '@/ui/ornaments';
import { colors, fonts, spacing } from '@/ui/styles/tokens';

const STORE_URL = 'https://zacatrus.es/kryptex.html';

export function Footer() {
  const openStore = () => {
    Linking.openURL(STORE_URL).catch(() => {});
  };
  return (
    <View style={styles.footer} testID="footer">
      <View style={styles.rule}>
        <FiligreeDivider width={150} />
      </View>
      <Text style={styles.text}>
        Inspirado en el juego de mesa Kryptex.{' '}
        <Text style={styles.link} onPress={openStore} testID="footer/store">
          Apoya al autor comprándolo
        </Text>
        .
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  rule: {
    marginBottom: spacing.xs,
    opacity: 0.7,
  },
  text: {
    fontFamily: fonts.serif,
    color: colors.textMuted,
    fontSize: 11,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  link: {
    color: colors.danger,
    textDecorationLine: 'underline',
  },
});
