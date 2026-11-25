import { useEffect } from 'react';
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react-native';
import { readFlag, writeFlag } from '@/ui/audio/preferences';
import { gameTourSteps, Rect, tourDoneKey, TRACKER_TOUR } from '@/ui/tutorial/tourSteps';
import { TourOverlay } from '@/ui/tutorial/TourOverlay';
import { TourTargetsProvider, useTourTargets } from '@/ui/tutorial/TourTargets';
import { useTour } from '@/ui/tutorial/useTour';
import { resetTutorial, TUTORIAL_DONE_KEY } from '@/ui/tutorial/useTutorial';

// En jest las vistas no se miden: esta zona falsa responde con un rectángulo
// fijo para comprobar que la capa ilumina lo que el registro mide.
function FakeTarget({ rect }: { rect: Rect }) {
  const registry = useTourTargets();
  useEffect(
    () =>
      registry?.register('board', {
        current: { measureInWindow: (cb: (...n: number[]) => void) => cb(rect.x, rect.y, rect.width, rect.height) },
      } as never),
    [registry, rect]
  );
  return null;
}

const STEPS = gameTourSteps('solo');

beforeEach(() => {
  writeFlag(tourDoneKey('game'), false);
  writeFlag(tourDoneKey('tracker'), false);
});

afterEach(() => {
  jest.useRealTimers();
});

describe('TourOverlay', () => {
  it('shows the step with its position in the tour', async () => {
    await render(<TourOverlay step={STEPS[0]} index={0} total={STEPS.length} onNext={() => {}} onSkip={() => {}} />);
    expect(screen.getByTestId('tour/title')).toHaveTextContent('La palabra sellada');
    expect(screen.getByText(`Presentación · 1 de ${STEPS.length}`)).toBeTruthy();
    expect(screen.getByText('Siguiente')).toBeTruthy();
  });

  it('renders nothing without a step', async () => {
    await render(<TourOverlay step={null} index={0} total={3} onNext={() => {}} onSkip={() => {}} />);
    expect(screen.queryByTestId('tour/overlay')).toBeNull();
  });

  it('ends with a button to start playing', async () => {
    const last = STEPS.length - 1;
    await render(<TourOverlay step={STEPS[last]} index={last} total={STEPS.length} onNext={() => {}} onSkip={() => {}} />);
    expect(screen.getByText('A jugar')).toBeTruthy();
  });

  it('calls next and skip', async () => {
    const onNext = jest.fn();
    const onSkip = jest.fn();
    await render(<TourOverlay step={STEPS[0]} index={0} total={STEPS.length} onNext={onNext} onSkip={onSkip} />);
    await fireEvent.press(screen.getByTestId('tour/next'));
    await fireEvent.press(screen.getByTestId('tour/skip'));
    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onSkip).toHaveBeenCalledTimes(1);
  });

  it('frames the measured zone of the step', async () => {
    jest.useFakeTimers();
    const boardStep = STEPS.find((s) => s.target === 'board')!;
    await render(
      <TourTargetsProvider>
        <FakeTarget rect={{ x: 20, y: 200, width: 280, height: 220 }} />
        <TourOverlay step={boardStep} index={2} total={STEPS.length} onNext={() => {}} onSkip={() => {}} />
      </TourTargetsProvider>
    );
    expect(screen.queryByTestId('tour/spotlight/board')).toBeNull();
    await act(async () => {
      jest.advanceTimersByTime(200);
    });
    expect(screen.getByTestId('tour/spotlight/board')).toHaveStyle({ left: 14, top: 194, width: 292, height: 232 });
  });
});

describe('useTour', () => {
  it('walks every step and remembers it is done', async () => {
    const { result } = await renderHook(() => useTour('tracker', TRACKER_TOUR, true));
    for (let i = 0; i < TRACKER_TOUR.length; i++) {
      expect(result.current.step?.target).toBe(TRACKER_TOUR[i].target);
      await act(async () => result.current.next());
    }
    expect(result.current.step).toBeNull();
    expect(result.current.active).toBe(false);
    expect(readFlag(tourDoneKey('tracker'), false)).toBe(true);
  });

  it('waits while disabled but stays active', async () => {
    const { result } = await renderHook(() => useTour('game', STEPS, false));
    expect(result.current.step).toBeNull();
    expect(result.current.active).toBe(true);
  });

  it('can be skipped', async () => {
    const { result } = await renderHook(() => useTour('game', STEPS, true));
    await act(async () => result.current.skip());
    expect(result.current.step).toBeNull();
    expect(readFlag(tourDoneKey('game'), false)).toBe(true);
  });

  it('does not show again once done', async () => {
    writeFlag(tourDoneKey('game'), true);
    const { result } = await renderHook(() => useTour('game', STEPS, true));
    expect(result.current.step).toBeNull();
  });

  it('comes back after resetting the tutorial', async () => {
    writeFlag(tourDoneKey('game'), true);
    writeFlag(tourDoneKey('tracker'), true);
    writeFlag(TUTORIAL_DONE_KEY, true);
    resetTutorial();
    expect(readFlag(tourDoneKey('game'), false)).toBe(false);
    expect(readFlag(tourDoneKey('tracker'), false)).toBe(false);
    expect(readFlag(TUTORIAL_DONE_KEY, false)).toBe(false);
  });
});
