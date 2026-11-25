import { act, fireEvent } from '@testing-library/react-native';
import { router } from 'expo-router';
import { renderRouter, screen } from 'expo-router/testing-library';
import { gameTourSteps, TRACKER_TOUR } from '@/ui/tutorial/tourSteps';

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

// El recorrido completo roza los 5 s por sí solo; con la suite en paralelo
// supera el timeout por defecto de jest.
jest.setTimeout(20000);

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
    expect(screen.getByTestId('lock-zone/mine')).toBeTruthy();

    // Primera partida: antes que los consejos, el tour presenta cada zona.
    expect(await screen.findByTestId('tour/overlay')).toBeTruthy();
    expect(screen.queryByTestId('tutorial/tip')).toBeNull();
    for (const step of gameTourSteps('solo')) {
      expect(screen.getByTestId('tour/title')).toHaveTextContent(step.title);
      await fireEvent.press(screen.getByTestId('tour/next'));
    }
    expect(screen.queryByTestId('tour/overlay')).toBeNull();

    // Acabado el tour, el tutorial explica el objetivo.
    expect(await screen.findByTestId('tutorial/tip')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('tutorial/skip'));

    // Interacción básica: seleccionar un dado abre el panel de acciones.
    await fireEvent.press(screen.getByTestId('cube/0'));
    expect(await screen.findByTestId('action/spin-cw')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('action/cancel'));

    // Tracker: su propio tour, que se puede saltar, y los seis contadores.
    await goTo('/tracker');
    expect(await screen.findByTestId('tour/overlay')).toBeTruthy();
    expect(screen.getByTestId('tour/title')).toHaveTextContent(TRACKER_TOUR[0].title);
    await fireEvent.press(screen.getByTestId('tour/skip'));
    expect(screen.queryByTestId('tour/overlay')).toBeNull();
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

    // Empezando el jugador, el marcador de turno lo trata de tú.
    await fireEvent.changeText(screen.getByTestId('setup/word'), 'CANTOR');
    await fireEvent.press(screen.getByTestId('setup/first-p1'));
    await fireEvent.press(screen.getByTestId('setup/start'));
    expect(await screen.findByTestId('versus/turn')).toHaveTextContent('Tu turno');
    // Una zona de bloqueo a cada lado del tablero, junto a cada palabra.
    expect(screen.getByText('Zona de bloqueo del maestro')).toBeTruthy();
    expect(screen.getByText('Tu zona de bloqueo')).toBeTruthy();
  });
});
