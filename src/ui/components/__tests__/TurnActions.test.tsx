import { render, screen } from '@testing-library/react-native';
import { TurnActions } from '@/ui/components/TurnActions';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

const noop = () => {};

describe('TurnActions', () => {
  it('gives every cube action its own arrow', async () => {
    await render(
      <TurnActions
        phase="choose-action"
        hint="¿Qué haces con este dado?"
        enabled
        onRotate={noop}
        onStartSwap={noop}
        onCancelAction={noop}
        onCancelSwap={noop}
        onEndTurn={noop}
      />
    );
    expect(screen.getByText('Voltear ↷')).toBeTruthy();
    expect(screen.getByText('Rotar ↻')).toBeTruthy();
    expect(screen.getByText('Intercambiar ⇄')).toBeTruthy();
  });
});
