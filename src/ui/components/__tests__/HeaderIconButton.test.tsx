import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { AudioControls } from '@/ui/components/AudioControls';
import { HeaderIconButton } from '@/ui/components/HeaderIconButton';
import { RulesButton } from '@/ui/components/RulesButton';

const mockMusic = { enabled: true };
const mockSfx = { enabled: true };
jest.mock('@/ui/audio/music', () => ({
  music: {
    isEnabled: () => mockMusic.enabled,
    toggle: () => (mockMusic.enabled = !mockMusic.enabled),
  },
}));
const mockInsets = { top: 48, bottom: 24, left: 0, right: 0 };
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => mockInsets,
}));
jest.mock('@/ui/audio/sound', () => ({
  audio: {
    isEnabled: () => mockSfx.enabled,
    setEnabled: (on: boolean) => (mockSfx.enabled = on),
  },
}));

beforeEach(() => {
  mockMusic.enabled = true;
  mockSfx.enabled = true;
});

describe('HeaderIconButton', () => {
  it('is a plain button when it is not a switch', async () => {
    const onPress = jest.fn();
    await render(<HeaderIconButton icon="rules" onPress={onPress} testID="x" accessibilityLabel="Reglas" />);
    const button = screen.getByTestId('x');
    expect(button.props.accessibilityRole).toBe('button');
    expect(screen.getByTestId('x/icon-on')).toBeTruthy();
    await fireEvent.press(button);
    expect(onPress).toHaveBeenCalled();
  });

  it('draws a switch that is off crossed out', async () => {
    await render(<HeaderIconButton icon="music" on={false} onPress={() => {}} testID="x" accessibilityLabel="Música" />);
    expect(screen.getByTestId('x').props.accessibilityState).toEqual({ checked: false });
    expect(screen.getByTestId('x/icon-off')).toBeTruthy();
  });
});

describe('header icons', () => {
  it('render the rules, music and effects buttons the same way', async () => {
    await render(
      <>
        <RulesButton />
        <AudioControls />
      </>
    );
    for (const id of ['rules/open', 'audio/music', 'audio/sfx']) {
      expect(screen.getByTestId(`${id}/icon-on`)).toBeTruthy();
    }
  });

  it('toggles music and effects independently', async () => {
    await render(<AudioControls />);
    await fireEvent.press(screen.getByTestId('audio/music'));
    expect(screen.getByTestId('audio/music/icon-off')).toBeTruthy();
    expect(screen.getByTestId('audio/sfx/icon-on')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('audio/sfx'));
    expect(mockSfx.enabled).toBe(false);
    expect(screen.getByTestId('audio/sfx/icon-off')).toBeTruthy();
    expect(screen.getByTestId('audio/sfx').props.accessibilityState).toEqual({ checked: false });
  });
});

describe('rules panel', () => {
  it('keeps its header below the status bar', async () => {
    await render(<RulesButton />);
    await fireEvent.press(screen.getByTestId('rules/open'));
    const header = screen.getByTestId('rules/header');
    expect(StyleSheet.flatten(header.props.style).paddingTop).toBeGreaterThan(mockInsets.top);
  });
});
