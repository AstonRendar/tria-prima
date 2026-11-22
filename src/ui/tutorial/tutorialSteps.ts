import { TurnPhase } from '@/ui/turnFlow';

// Tutorial de la primera partida: consejos que aparecen cuando la situación
// del turno los hace útiles, cada uno una sola vez y en este orden de prioridad.
export type TutorialStepId =
  | 'goal'
  | 'select'
  | 'actions'
  | 'second-cube'
  | 'declare'
  | 'locked'
  | 'markers'
  | 'guess';

export type TutorialContext = {
  readonly isMyTurn: boolean;
  readonly phase: TurnPhase;
  readonly touchedCount: number;
  readonly hasLockedCubes: boolean;
  readonly anyMarker: boolean;
  readonly canGuess: boolean;
};

export type TutorialStep = {
  readonly id: TutorialStepId;
  readonly title: string;
  readonly body: string;
  readonly when: (c: TutorialContext) => boolean;
};

export const TUTORIAL_STEPS: ReadonlyArray<TutorialStep> = [
  {
    id: 'goal',
    title: 'El objetivo',
    body: 'Hay una palabra secreta de 6 letras. Cada letra está tapada por una carta con una insignia (un símbolo o un color). Alinea dados para marcar esas cartas y descubrir las letras.',
    when: (c) => c.isMyTurn,
  },
  {
    id: 'select',
    title: 'Tu turno',
    body: 'En cada turno mueves exactamente 2 dados distintos. Empieza tocando uno.',
    when: (c) => c.isMyTurn && c.phase === 'select-cube' && c.touchedCount === 0,
  },
  {
    id: 'actions',
    title: 'Qué hacer con el dado',
    body: 'Voltear cambia la cara de arriba. Rotar lo gira sobre sí mismo sin cambiarla. Intercambiar cambia de sitio dos dados de la misma fila o columna, y cuenta como tu jugada entera.',
    when: (c) => c.isMyTurn && c.phase === 'choose-action',
  },
  {
    id: 'second-cube',
    title: 'Segundo dado',
    body: 'Bien. Ahora mueve otro dado distinto: el que ya has movido no se puede volver a tocar este turno.',
    when: (c) => c.isMyTurn && c.phase === 'select-cube' && c.touchedCount === 1,
  },
  {
    id: 'declare',
    title: 'Objetivos',
    body: 'Una fila o columna con los 3 dados del mismo símbolo o del mismo color cumple un objetivo. Al mover el segundo dado se declaran solos y pasan a tu zona de bloqueo, donde el rival no puede usarlos. En el primer turno de la partida no se declara.',
    when: (c) => c.isMyTurn && c.phase === 'declare',
  },
  {
    id: 'locked',
    title: 'Dados bloqueados',
    body: 'Los dados remarcados son los que movió el rival en su turno: este turno no puedes tocarlos. Lo mismo le pasará a él con los tuyos.',
    when: (c) => c.isMyTurn && c.phase === 'select-cube' && c.hasLockedCubes,
  },
  {
    id: 'markers',
    title: 'Marcadores',
    body: 'Cada objetivo declarado pone un marcador en la carta con su misma insignia. Con 2 marcadores la letra se revela. Si tu alineación sigue en pie cuando te vuelva el turno, vuelve a puntuar.',
    when: (c) => c.anyMarker,
  },
  {
    id: 'guess',
    title: 'Adivinar',
    body: 'Con 4 letras o más, al final de un turno en el que acabes de descubrir una, puedes intentar adivinar. Solo hay un intento: si fallas, pierdes.',
    when: (c) => c.canGuess,
  },
];

export function nextTutorialStep(
  context: TutorialContext,
  seen: ReadonlySet<TutorialStepId>
): TutorialStep | null {
  return TUTORIAL_STEPS.find((s) => !seen.has(s.id) && s.when(context)) ?? null;
}
