import { render, screen } from '@testing-library/react-native';
import Home from '../../../app/index';
import { spacing } from '@/ui/styles/tokens';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 48, left: 0, right: 0 }),
}));

describe('Home', () => {
  it('keeps the footer above the system navigation bar', async () => {
    await render(<Home />);
    expect(screen.getByTestId('home/footer')).toHaveStyle({
      paddingBottom: spacing.sm + 48,
    });
    expect(screen.getByTestId('home/footer')).not.toHaveStyle({ position: 'absolute' });
  });
});
