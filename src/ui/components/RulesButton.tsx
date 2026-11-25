import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActionButton } from '@/ui/components/ActionButton';
import { HeaderIconButton } from '@/ui/components/HeaderIconButton';
import { RulesBook } from '@/ui/components/RulesBook';
import { ParchmentBackground } from '@/ui/ornaments';
import { colors, fonts, spacing } from '@/ui/styles/tokens';

// Abre las reglas en un panel a pantalla completa sin salir de la partida.
export function RulesButton() {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();
  return (
    <>
      <HeaderIconButton
        icon="rules"
        onPress={() => setOpen(true)}
        testID="rules/open"
        accessibilityLabel="Consultar las reglas"
      />
      <Modal
        visible={open}
        animationType="slide"
        onRequestClose={() => setOpen(false)}
        testID="rules/modal"
      >
        <View style={styles.page}>
          <ParchmentBackground />
          <View style={[styles.header, { paddingTop: insets.top + spacing.md }]} testID="rules/header">
            <Text style={styles.title}>Reglas</Text>
            <ActionButton label="Volver a la partida" onPress={() => setOpen(false)} testID="rules/close" />
          </View>
          <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}>
            <RulesBook />
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  title: {
    fontFamily: fonts.serif,
    color: colors.accent,
    fontSize: 24,
    fontWeight: '800',
  },
  content: {
    padding: spacing.lg,
  },
});
