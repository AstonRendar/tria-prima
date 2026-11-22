import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { music } from '@/ui/audio/music';
import { loadPreferences } from '@/ui/audio/preferences';
import { AudioControls } from '@/ui/components/AudioControls';
import { HeaderBackButton } from '@/ui/components/HeaderBackButton';
import { RulesButton } from '@/ui/components/RulesButton';
import { ConfirmProvider } from '@/ui/ConfirmProvider';
import { colors, fonts } from '@/ui/styles/tokens';

function HeaderActions() {
  return (
    <View style={styles.headerActions}>
      <RulesButton />
      <AudioControls />
    </View>
  );
}

function MenuBackButton() {
  const router = useRouter();
  return <HeaderBackButton onPress={() => router.dismissTo('/')} />;
}

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    loadPreferences().then(() => {
      music.init();
      setReady(true);
    });
  }, []);
  if (!ready) return null;
  return (
    <ConfirmProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerTitleStyle: { fontFamily: fonts.serif, fontWeight: '700' },
          contentStyle: { backgroundColor: colors.background },
          headerRight: () => <HeaderActions />,
          // El botón nativo de retroceso queda fuera: la vuelta pasa por
          // HeaderBackButton; con partida en curso, useExitGuard pide
          // confirmación también para el botón atrás y el gesto del sistema.
          headerBackVisible: false,
          headerLeft: () => <MenuBackButton />,
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Tria Prima', headerLeft: () => null }} />
        <Stack.Screen
          name="instructions"
          options={{ title: 'Reglas', headerRight: () => <AudioControls /> }}
        />
        <Stack.Screen name="play" options={{ title: 'Duelo a dos' }} />
        <Stack.Screen name="versus" options={{ title: 'Contra el maestro' }} />
        <Stack.Screen name="solo" options={{ title: 'Desafío' }} />
        <Stack.Screen name="tracker" options={{ title: 'Con el juego físico' }} />
      </Stack>
    </ConfirmProvider>
  );
}

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
