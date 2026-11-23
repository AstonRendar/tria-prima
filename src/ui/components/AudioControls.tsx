import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { music } from '@/ui/audio/music';
import { audio } from '@/ui/audio/sound';
import { HeaderIconButton } from '@/ui/components/HeaderIconButton';

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
      <HeaderIconButton
        icon="music"
        on={musicOn}
        onPress={() => setMusicOn(music.toggle())}
        testID="audio/music"
        accessibilityLabel="Música"
      />
      <HeaderIconButton
        icon="sfx"
        on={sfxOn}
        onPress={toggleSfx}
        testID="audio/sfx"
        accessibilityLabel="Efectos de sonido"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
