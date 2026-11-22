import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ActionButton } from '@/ui/components/ActionButton';
import { RulesBook } from '@/ui/components/RulesBook';
import { ParchmentBackground } from '@/ui/ornaments';
import { colors, fonts, spacing } from '@/ui/styles/tokens';

// Abre las reglas en un panel a pantalla completa sin salir de la partida.
export function RulesButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable
        style={styles.button}
        onPress={() => setOpen(true)}
        testID="rules/open"
        accessibilityRole="button"
        accessibilityLabel="Consultar las reglas"
      >
        <Text style={styles.icon}>?</Text>
      </Pressable>
      <Modal
        visible={open}
        animationType="slide"
        onRequestClose={() => setOpen(false)}
        testID="rules/modal"
      >
        <View style={styles.page}>
          <ParchmentBackground />
          <View style={styles.header}>
            <Text style={styles.title}>Reglas</Text>
            <ActionButton label="Volver a la partida" onPress={() => setOpen(false)} testID="rules/close" />
          </View>
          <ScrollView contentContainerStyle={styles.content}>
            <RulesBook />
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontFamily: fonts.serif,
    color: colors.accent,
    fontSize: 22,
    fontWeight: '800',
  },
  page: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
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
    paddingBottom: spacing.xxl,
  },
});
