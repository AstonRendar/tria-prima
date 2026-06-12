import { act, renderHook } from '@testing-library/react-native';
import { StubRandom, StubWordRepository } from '@/application/__tests__/testdoubles';
import { useVersus } from '@/ui/hooks/useVersus';

// El maestro juega solo cuando recibe el turno: sus pasos salen con retardo
// (fake timers) y al terminar devuelve el control al humano.
describe('useVersus', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('plays the app turn step by step and hands control back', async () => {
    const deps = {
      random: new StubRandom([0]),
      wordRepository: new StubWordRepository('PUERTA', ['PUERTA', 'CAMINO']),
    };
    const { result } = await renderHook(() => useVersus(deps));

    await act(async () => {
      result.current.start({ playerName: 'Tú', playerWord: 'CAMINO', level: 'master' });
    });
    expect(result.current.state?.currentPlayerId).toBe('p1');

    await act(async () => {
      result.current.rotate(3, 'spin-cw');
    });
    await act(async () => {
      result.current.rotate(4, 'spin-cw');
    });
    await act(async () => {
      result.current.finishTurn([3, 4]);
    });

    expect(result.current.state?.currentPlayerId).toBe('p2');
    expect(result.current.appPlaying).toBe(true);

    // Como mucho 4 pasos (2 acciones + declaración + fin de turno) a 900 ms.
    await act(async () => {
      jest.advanceTimersByTime(5 * 900);
    });

    const state = result.current.state;
    expect(state?.currentPlayerId).toBe('p1');
    expect(state?.turn).toBe(2);
    expect(new Set(state?.board.lockedThisTurn).size).toBe(2);
    expect(state?.finished).toBe(false);
    expect(result.current.appPlaying).toBe(false);
  });

  it('does not start playing while it is the human turn', async () => {
    const deps = {
      random: new StubRandom([0]),
      wordRepository: new StubWordRepository('PUERTA'),
    };
    const { result } = await renderHook(() => useVersus(deps));
    await act(async () => {
      result.current.start({ playerName: 'Tú', playerWord: 'CAMINO', level: 'master' });
    });
    await act(async () => {
      jest.advanceTimersByTime(10 * 900);
    });
    expect(result.current.appPlaying).toBe(false);
    expect(result.current.state?.turn).toBe(0);
  });
});
