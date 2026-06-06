import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { music } from '@/ui/audio/music';
import { AudioControls } from '@/ui/components/AudioControls';
import { ConfirmProvider } from '@/ui/ConfirmProvider';
import { colors, fonts } from '@/ui/styles/tokens';

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
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Tria Prima' }} />
        <Stack.Screen name="instructions" options={{ title: 'Reglas' }} />
        <Stack.Screen name="play" options={{ title: 'Duelo' }} />
        <Stack.Screen name="solo" options={{ title: 'En soledad · digital' }} />
        <Stack.Screen name="tracker" options={{ title: 'En soledad · físico' }} />
      </Stack>
    </ConfirmProvider>
  );
}
