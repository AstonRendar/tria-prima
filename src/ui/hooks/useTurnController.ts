import { useCallback, useEffect, useRef, useState } from 'react';
import { TOUCHES_PER_TURN } from '@/domain/Board';
import { RotationKind } from '@/domain/Cube';
import { Position } from '@/domain/Position';
import { audio, SoundKey } from '@/ui/audio/sound';
import { CubeAnimationKind } from '@/ui/components/CubeView';
import {
  cancelAction,
  cancelSwap,
  canFinishTurn,
  commitSwap,
  describeDeclareResult,
  initialTurnState,
  pressCube,
  rotateSelected,
  startSwap,
  TurnState,
  turnMessage,
} from '@/ui/turnFlow';

const REVEAL_SOUND_DELAY_MS = 200;

export type CubeAnimation = {
  readonly positions: ReadonlySet<Position>;
  readonly kind: CubeAnimationKind;
};

export type DeclareSummary = {
  readonly declared: number;
  readonly released: number;
  readonly revealedCardIndices: ReadonlyArray<number>;
};

// Lo que cada modo expone de su partida para que el turno se juegue igual en
// todos: los casos de uso de girar, intercambiar, declarar y cerrar el turno.
export type TurnPort = {
  rotate: (position: Position, kind: RotationKind) => void;
  swap: (a: Position, b: Position) => boolean;
  declare: () => DeclareSummary;
  finishTurn: () => void;
};

type Options = {
  port: TurnPort;
  // Dados que movió el rival: no se pueden tocar este turno.
  locked: ReadonlyArray<Position>;
  canDeclare: boolean;
  // Falso mientras no le toca al humano (turno del maestro o partida acabada).
  enabled: boolean;
  showMessage: (message: string) => void;
};

export function rotationSfx(kind: RotationKind): SoundKey {
  return kind === 'spin-cw' || kind === 'spin-ccw' ? 'cube-spin' : 'cube-roll';
}

// Control del turno del humano compartido por duelo, contra el maestro y
// desafío: estado de interacción (turnFlow), efectos de sonido y animación, y
// la declaración automática al mover el segundo dado.
export function useTurnController({ port, locked, canDeclare, enabled, showMessage }: Options) {
  const [turn, setTurn] = useState<TurnState>(initialTurnState);
  const [animation, setAnimation] = useState<CubeAnimation | null>(null);
  const autoDeclaredRef = useRef(false);
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    },
    []
  );

  useEffect(() => {
    if (turn.phase !== 'declare') {
      autoDeclaredRef.current = false;
      return;
    }
    if (autoDeclaredRef.current || !canDeclare || !enabled) return;
    autoDeclaredRef.current = true;
    const result = port.declare();
    if (result.declared > 0) audio.play('objective');
    if (result.revealedCardIndices.length > 0) {
      revealTimerRef.current = setTimeout(
        () => audio.play('reveal'),
        result.declared > 0 ? REVEAL_SOUND_DELAY_MS : 0
      );
    }
    const msg = describeDeclareResult(
      result.declared,
      result.released,
      result.revealedCardIndices.length
    );
    if (msg) showMessage(msg);
  }, [turn.phase, canDeclare, enabled, port, showMessage]);

  const reset = useCallback(() => {
    setTurn(initialTurnState);
    setAnimation(null);
  }, []);

  const onPressCube = (position: Position) => {
    if (!enabled) return;
    const outcome = pressCube(turn, position, locked);
    if (outcome.message) showMessage(turnMessage(outcome.message));
    if (outcome.swap) {
      const { a, b } = outcome.swap;
      if (!port.swap(a, b)) {
        showMessage('Solo puedes intercambiar en la misma fila o columna');
        return;
      }
      audio.play('swap');
      setAnimation({ positions: new Set([a, b]), kind: 'swap' });
      setTurn(commitSwap(a, b));
      return;
    }
    if (outcome.state !== turn) setTurn(outcome.state);
  };

  const onRotate = (kind: RotationKind) => {
    if (turn.selected === null) return;
    const target = turn.selected;
    port.rotate(target, kind);
    audio.play(rotationSfx(kind));
    setAnimation({ positions: new Set([target]), kind });
    setTurn(rotateSelected(turn));
  };

  const onStartSwap = () => {
    const outcome = startSwap(turn);
    if (outcome.message) showMessage(turnMessage(outcome.message));
    setTurn(outcome.state);
  };

  const onEndTurn = () => {
    if (!canFinishTurn(turn)) {
      showMessage(`Hay que mover ${TOUCHES_PER_TURN} dados para acabar el turno`);
      return;
    }
    audio.play('turn-end');
    port.finishTurn();
    reset();
  };

  return {
    turn,
    animation,
    reset,
    onPressCube,
    onRotate,
    onStartSwap,
    onCancelAction: () => setTurn(cancelAction(turn)),
    onCancelSwap: () => setTurn(cancelSwap(turn)),
    onEndTurn,
  };
}
