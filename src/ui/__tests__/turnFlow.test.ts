import {
  canFinishTurn,
  cancelAction,
  cancelSwap,
  commitSwap,
  describeDeclareResult,
  describePhase,
  initialTurnState,
  pressCube,
  rotateSelected,
  rotationActions,
  startSwap,
  turnMessage,
  TurnState,
} from '@/ui/turnFlow';

const touchedState = (touched: number[], rest: Partial<TurnState> = {}): TurnState => ({
  phase: 'select-cube',
  selected: null,
  touched: new Set(touched),
  ...rest,
});

describe('pressCube', () => {
  it('selects the first cube and opens the action panel', () => {
    const { state } = pressCube(initialTurnState, 4);
    expect(state).toEqual({ phase: 'choose-action', selected: 4, touched: new Set() });
  });

  it('deselects when the selected cube is pressed again', () => {
    const start = touchedState([], { phase: 'choose-action', selected: 4 });
    const { state } = pressCube(start, 4);
    expect(state.phase).toBe('select-cube');
    expect(state.selected).toBeNull();
  });

  it('reselects a different cube while choosing the action', () => {
    const start = touchedState([], { phase: 'choose-action', selected: 4 });
    const { state } = pressCube(start, 5);
    expect(state).toEqual({ phase: 'choose-action', selected: 5, touched: new Set() });
  });

  it('blocks a cube already moved this turn without changing state', () => {
    const start = touchedState([4]);
    const outcome = pressCube(start, 4);
    expect(outcome.message).toBe('already-touched');
    expect(outcome.state).toBe(start);
  });

  it('blocks any cube once the move phase is closed', () => {
    const start = touchedState([4, 5], { phase: 'declare' });
    const outcome = pressCube(start, 1);
    expect(outcome.message).toBe('already-declared');
    expect(outcome.state).toBe(start);
  });

  it('requires a different second cube to swap', () => {
    const start = touchedState([], { phase: 'select-second-cube', selected: 4 });
    const outcome = pressCube(start, 4);
    expect(outcome.message).toBe('pick-different-cube');
    expect(outcome.swap).toBeUndefined();
  });

  it('requests a swap between the two chosen cubes', () => {
    const start = touchedState([], { phase: 'select-second-cube', selected: 4 });
    const outcome = pressCube(start, 5);
    expect(outcome.swap).toEqual({ a: 4, b: 5 });
  });

  it('ignores the second cube when none is selected', () => {
    const start = touchedState([], { phase: 'select-second-cube' });
    const outcome = pressCube(start, 5);
    expect(outcome.state).toBe(start);
    expect(outcome.swap).toBeUndefined();
  });
});

describe('rotateSelected', () => {
  it('marks the selected cube as moved and keeps selecting until two', () => {
    const start = touchedState([], { phase: 'choose-action', selected: 4 });
    const state = rotateSelected(start);
    expect(state).toEqual({ phase: 'select-cube', selected: null, touched: new Set([4]) });
  });

  it('moves to the declaration phase once two distinct cubes are moved', () => {
    const start = touchedState([4], { phase: 'choose-action', selected: 5 });
    const state = rotateSelected(start);
    expect(state.phase).toBe('declare');
    expect(state.touched).toEqual(new Set([4, 5]));
  });

  it('does nothing without a selected cube', () => {
    const start = touchedState([4]);
    expect(rotateSelected(start)).toBe(start);
  });

  // Regresión del bug: girar el mismo dado no puede cerrar el turno por sí solo.
  it('cannot end a turn by rotating the same cube twice', () => {
    let state = pressCube(initialTurnState, 4).state; // choose-action
    state = rotateSelected(state); // touched {4}, select-cube
    expect(state.phase).toBe('select-cube');

    const retry = pressCube(state, 4); // volver a tocar el 4 está bloqueado
    expect(retry.message).toBe('already-touched');
    expect(retry.state).toBe(state);

    // Solo un segundo dado distinto llega a 'declare'.
    const second = rotateSelected(pressCube(state, 5).state);
    expect(second.phase).toBe('declare');
  });
});

describe('startSwap', () => {
  it('does nothing without a selected cube', () => {
    expect(startSwap(initialTurnState).state).toBe(initialTurnState);
  });

  it('is only allowed as the only action of the turn', () => {
    const start = touchedState([4], { phase: 'choose-action', selected: 5 });
    const outcome = startSwap(start);
    expect(outcome.message).toBe('swap-only-action');
    expect(outcome.state).toBe(start);
  });

  it('opens the second-cube selection', () => {
    const start = touchedState([], { phase: 'choose-action', selected: 4 });
    expect(startSwap(start).state.phase).toBe('select-second-cube');
  });
});

describe('swap / cancel helpers', () => {
  it('commits a swap into the declaration phase', () => {
    expect(commitSwap(3, 5)).toEqual({
      phase: 'declare',
      selected: null,
      touched: new Set([3, 5]),
    });
  });

  it('cancels the action back to cube selection', () => {
    const start = touchedState([], { phase: 'choose-action', selected: 4 });
    expect(cancelAction(start)).toEqual({ phase: 'select-cube', selected: null, touched: new Set() });
  });

  it('cancels a swap back to the action panel keeping the selection', () => {
    const start = touchedState([], { phase: 'select-second-cube', selected: 4 });
    expect(cancelSwap(start)).toEqual({
      phase: 'choose-action',
      selected: 4,
      touched: new Set(),
    });
  });
});

describe('canFinishTurn', () => {
  it('is false until two cubes are moved', () => {
    expect(canFinishTurn(touchedState([4]))).toBe(false);
    expect(canFinishTurn(touchedState([4, 5]))).toBe(true);
  });
});

describe('presentation helpers', () => {
  it('maps every turn message to text', () => {
    expect(turnMessage('already-declared')).toContain('Acaba el turno');
    expect(turnMessage('already-touched')).toContain('ya lo has movido');
    expect(turnMessage('pick-different-cube')).toContain('otro dado');
    expect(turnMessage('swap-only-action')).toContain('intercambiar');
  });

  it('offers one button per movement', () => {
    expect(rotationActions().map((a) => a.kind)).toEqual(['roll-forward', 'spin-cw']);
  });

  it('describes the declaration result only when something happened', () => {
    expect(describeDeclareResult(0, 0, 0)).toBeNull();
    expect(describeDeclareResult(2, 1, 1)).toBe('Declarados 2 · Liberados 1 · Letra revelada');
  });

  it('describes each phase', () => {
    expect(describePhase('select-cube', 0)).toContain('empezar');
    expect(describePhase('select-cube', 1)).toContain('segundo');
    expect(describePhase('choose-action', 0)).toContain('dado seleccionado');
    expect(describePhase('select-second-cube', 0)).toContain('misma fila');
    expect(describePhase('declare', 2)).toContain('Acabar turno');
  });
});
