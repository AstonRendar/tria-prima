import { act, fireEvent } from '@testing-library/react-native';
import { router } from 'expo-router';
import { renderRouter, screen } from 'expo-router/testing-library';

// Smoke test de recorrido: el store de navegación de expo-router es global y
// renderRouter no lo reinicia entre tests, así que un único render recorre
// todas las pantallas navegando imperativamente. Tras cada salto, la primera
// aserción usa findBy* porque la transición de pantalla es asíncrona.
// renderRouter activa fake timers; se restauran al acabar.
afterEach(() => {
  jest.useRealTimers();
});

async function goTo(url: string) {
  await act(async () => {
    router.navigate(url);
  });
}

describe('app smoke', () => {
  it('walks through every main screen', async () => {
    await renderRouter('./app', { initialUrl: '/' });

    // Home: los cinco accesos.
    expect(await screen.findByTestId('home/play')).toBeTruthy();
    expect(screen.getByTestId('home/versus')).toBeTruthy();
    expect(screen.getByTestId('home/solo')).toBeTruthy();
    expect(screen.getByTestId('home/tracker')).toBeTruthy();
    expect(screen.getByTestId('home/instructions')).toBeTruthy();

    // Manual.
    await goTo('/instructions');
    expect(await screen.findByText('Reglas del cifrado')).toBeTruthy();

    // Solitario digital: tablero 3x3 completo y aviso de primer turno.
    await goTo('/solo');
    expect(await screen.findByTestId('cube/0')).toBeTruthy();
    for (let i = 1; i < 9; i++) {
      expect(screen.getByTestId(`cube/${i}`)).toBeTruthy();
    }
    expect(screen.getByTestId('first-turn-notice')).toBeTruthy();

    // Interacción básica: seleccionar un dado abre el panel de acciones.
    fireEvent.press(screen.getByTestId('cube/0'));
    expect(await screen.findByTestId('action/spin-cw')).toBeTruthy();
    fireEvent.press(screen.getByTestId('action/cancel'));

    // Tracker: los seis contadores de objetivo.
    await goTo('/tracker');
    expect(await screen.findByTestId('objective/sym:sulfur/+')).toBeTruthy();
    for (const id of ['sym:mercury', 'sym:salt', 'col:nigredo', 'col:citrinitas', 'col:rubedo']) {
      expect(screen.getByTestId(`objective/${id}/+`)).toBeTruthy();
    }

    // Duelo: arranca en la pantalla de preparación.
    await goTo('/play');
    expect(await screen.findByTestId('setup/p1')).toBeTruthy();

    // Contra el maestro: pide la palabra del jugador y el nivel.
    await goTo('/versus');
    expect(await screen.findByTestId('setup/word')).toBeTruthy();
    expect(screen.getByTestId('setup/level-apprentice')).toBeTruthy();
    expect(screen.getByTestId('setup/level-master')).toBeTruthy();
    expect(screen.getByTestId('setup/start')).toBeTruthy();
  });
});
