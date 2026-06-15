import { TOUCHES_PER_TURN } from '@/domain/Board';
import { RotationKind } from '@/domain/Cube';
import { Position } from '@/domain/Position';

// Flujo de turno compartido por las pantallas de duelo, contra el maestro y
// solitario. La lógica de la transición vive aquí como funciones puras; las
// pantallas solo ejecutan los efectos (audio, animación, dominio).

export type TurnPhase =
  | 'select-cube'
  | 'choose-action'
  | 'select-second-cube'
  | 'declare';

// Estado de interacción del turno: qué dado está seleccionado, en qué fase
// estamos y qué dados ya se han movido (no pueden volver a tocarse).
export type TurnState = {
  readonly phase: TurnPhase;
  readonly selected: Position | null;
  readonly touched: ReadonlySet<Position>;
};

export const initialTurnState: TurnState = {
  phase: 'select-cube',
  selected: null,
  touched: new Set<Position>(),
};

// Avisos que la UI muestra (flash) tras una transición rechazada.
export type TurnMessage =
  | 'already-declared'
  | 'already-touched'
  | 'pick-different-cube'
  | 'swap-only-action';

export function turnMessage(message: TurnMessage): string {
  switch (message) {
    case 'already-declared':
      return 'Ya has movido tus dos dados. Acaba el turno.';
    case 'already-touched':
      return 'Ese dado ya lo has movido; elige otro distinto';
    case 'pick-different-cube':
      return 'Selecciona otro dado distinto';
    case 'swap-only-action':
      return 'Para intercambiar, ha de ser tu única acción del turno';
  }
}

// Resultado de tocar un dado: el nuevo estado y, opcionalmente, un aviso o una
// petición de intercambio que la pantalla debe ejecutar contra el dominio.
export type PressOutcome = {
  readonly state: TurnState;
  readonly message?: TurnMessage;
  readonly swap?: { readonly a: Position; readonly b: Position };
};

// Toca un dado. La pantalla ya ha descartado los casos previos (partida
// terminada, turno ajeno o dado bloqueado). Si el estado no cambia, devuelve el
// mismo objeto para que la pantalla pueda evitar un re-render innecesario.
export function pressCube(state: TurnState, position: Position): PressOutcome {
  if (state.phase === 'declare') {
    return { state, message: 'already-declared' };
  }
  if (state.touched.has(position)) {
    return { state, message: 'already-touched' };
  }
  if (state.phase === 'select-cube') {
    return { state: { ...state, selected: position, phase: 'choose-action' } };
  }
  if (state.phase === 'choose-action') {
    if (state.selected === position) {
      return { state: { ...state, selected: null, phase: 'select-cube' } };
    }
    return { state: { ...state, selected: position } };
  }
  // select-second-cube
  if (state.selected === null) return { state };
  if (position === state.selected) {
    return { state, message: 'pick-different-cube' };
  }
  return { state, swap: { a: state.selected, b: position } };
}

// Gira/voltea el dado seleccionado: lo marca como movido. Al llegar a los dados
// por turno, pasa a la fase de declaración; si no, vuelve a seleccionar.
export function rotateSelected(state: TurnState): TurnState {
  if (state.selected === null) return state;
  const touched = new Set(state.touched);
  touched.add(state.selected);
  return {
    phase: touched.size >= TOUCHES_PER_TURN ? 'declare' : 'select-cube',
    selected: null,
    touched,
  };
}

// Inicia un intercambio: solo es legal como única acción del turno.
export function startSwap(state: TurnState): PressOutcome {
  if (state.selected === null) return { state };
  if (state.touched.size > 0) {
    return { state, message: 'swap-only-action' };
  }
  return { state: { ...state, phase: 'select-second-cube' } };
}

// Confirma un intercambio aplicado: ambos dados quedan movidos y se declara.
export function commitSwap(a: Position, b: Position): TurnState {
  return { phase: 'declare', selected: null, touched: new Set([a, b]) };
}

// Cancela la acción en curso y vuelve a la selección del primer dado.
export function cancelAction(state: TurnState): TurnState {
  return { ...state, selected: null, phase: 'select-cube' };
}

// Cancela el intercambio y vuelve al panel de acciones del dado seleccionado.
export function cancelSwap(state: TurnState): TurnState {
  return { ...state, phase: 'choose-action' };
}

export function canFinishTurn(state: TurnState): boolean {
  return state.touched.size >= TOUCHES_PER_TURN;
}

// Los dados tienen caras opuestas idénticas (ver CUBE_SET), así que voltear
// adelante/atrás y rotar ↻/↺ son equivalentes: basta un botón por movimiento.
export function rotationActions(): ReadonlyArray<{ label: string; kind: RotationKind }> {
  return [
    { label: 'Voltear ↷', kind: 'roll-forward' },
    { label: 'Rotar ↻', kind: 'spin-cw' },
  ];
}

export function describeDeclareResult(
  declared: number,
  released: number,
  revealed: number
): string | null {
  const parts: string[] = [];
  if (declared > 0) parts.push(`Declarados ${declared}`);
  if (released > 0) parts.push(`Liberados ${released}`);
  if (revealed > 0) parts.push('Letra revelada');
  return parts.length > 0 ? parts.join(' · ') : null;
}

export function describePhase(phase: TurnPhase, touchedCount: number): string {
  if (phase === 'declare') {
    return 'Objetivos cumplidos declarados. Pulsa "Acabar turno" cuando estés listo.';
  }
  if (phase === 'choose-action') {
    return 'Elige qué hacer con el dado seleccionado.';
  }
  if (phase === 'select-second-cube') {
    return 'Selecciona otro dado en la misma fila o columna.';
  }
  return touchedCount === 0
    ? 'Selecciona un dado para empezar tu jugada.'
    : 'Selecciona un segundo dado.';
}
