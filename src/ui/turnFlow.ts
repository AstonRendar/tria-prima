import { RotationKind } from '@/domain/Cube';

// Flujo de turno compartido por las pantallas de duelo y solitario.

export type TurnPhase =
  | 'select-cube'
  | 'choose-action'
  | 'select-second-cube'
  | 'declare';

// El único texto que varía entre modos es hacia quién se voltea el dado
// ("al rival" en duelo, "al maestro" en solitario).
export function rotationActions(
  forwardTarget: string
): ReadonlyArray<{ label: string; kind: RotationKind }> {
  return [
    { label: 'Voltear hacia ti', kind: 'roll-backward' },
    { label: `Voltear ${forwardTarget}`, kind: 'roll-forward' },
    { label: 'Rotar ↻', kind: 'spin-cw' },
    { label: 'Rotar ↺', kind: 'spin-ccw' },
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
