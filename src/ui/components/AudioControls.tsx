import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { music } from '@/ui/audio/music';
import { audio } from '@/ui/audio/sound';
import { colors, fonts, spacing } from '@/ui/styles/tokens';

export function AudioControls() {
  const [musicOn, setMusicOn] = useState(music.isEnabled());
  const [sfxOn, setSfxOn] = useState(audio.isEnabled());

  const toggleSfx = () => {
    const next = !sfxOn;
    audio.setEnabled(next);
    setSfxOn(next);
  };

  return (
    <View style={styles.row}>
      <Pressable
        style={styles.button}
        onPress={() => setMusicOn(music.toggle())}
        testID="audio/music"
        accessibilityLabel={musicOn ? 'Apagar música' : 'Encender música'}
      >
        <Text style={[styles.icon, !musicOn && styles.iconOff]}>♪</Text>
      </Pressable>
      <Pressable
        style={styles.button}
        onPress={toggleSfx}
        testID="audio/sfx"
        accessibilityLabel={sfxOn ? 'Apagar efectos' : 'Encender efectos'}
      >
        <Text style={styles.icon}>{sfxOn ? '🔊' : '🔇'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.xs,
  },
  icon: {
    fontFamily: fonts.serif,
    color: colors.accent,
    fontSize: 18,
  },
  iconOff: {
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
});
