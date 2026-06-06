import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { music } from '@/ui/audio/music';
import { AudioControls } from '@/ui/components/AudioControls';
import { HeaderBackButton } from '@/ui/components/HeaderBackButton';
import { ConfirmProvider } from '@/ui/ConfirmProvider';
import { colors, fonts } from '@/ui/styles/tokens';

function MenuBackButton() {
  const router = useRouter();
  return <HeaderBackButton onPress={() => router.dismissTo('/')} />;
}

export default function RootLayout() {
  useEffect(() => {
    music.init();
  }, []);
  return (
    <ConfirmProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerTitleStyle: { fontFamily: fonts.serif, fontWeight: '700' },
          contentStyle: { backgroundColor: colors.background },
          headerRight: () => <AudioControls />,
          // El botón nativo de retroceso queda fuera: toda la navegación de
          // vuelta pasa por HeaderBackButton (flecha sola, con confirmación
          // si hay partida en curso).
          headerBackVisible: false,
          headerLeft: () => <MenuBackButton />,
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Tria Prima', headerLeft: () => null }} />
        <Stack.Screen name="instructions" options={{ title: 'Reglas' }} />
        <Stack.Screen name="play" options={{ title: 'Duelo' }} />
        <Stack.Screen name="solo" options={{ title: 'En soledad · digital' }} />
        <Stack.Screen name="tracker" options={{ title: 'En soledad · físico' }} />
      </Stack>
    </ConfirmProvider>
  );
}
