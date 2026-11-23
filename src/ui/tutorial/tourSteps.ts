// Tour de presentación: antes de la primera partida recorre cada zona de la
// pantalla iluminándola y explicando qué es. Los consejos del tutorial
// (tutorialSteps) explican después qué hacer en cada momento.
export type TourKind = 'game' | 'tracker';

export type TourMode = 'solo' | 'versus' | 'duel';

export type TourTargetId =
  | 'word'
  | 'cube'
  | 'board'
  | 'objectives'
  | 'my-word'
  | 'actions'
  | 'counters'
  | 'guess'
  | 'rules';

export type TourStep = {
  readonly target: TourTargetId;
  readonly title: string;
  readonly body: string;
};

export type Rect = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

const RULES_STEP: TourStep = {
  target: 'rules',
  title: 'Las reglas',
  body: 'Con «?» consultas las reglas completas sin salir de la partida. Mientras juegas te iré dando algún consejo.',
};

export function gameTourSteps(mode: TourMode): ReadonlyArray<TourStep> {
  const solo = mode === 'solo';
  const steps: TourStep[] = [
    {
      target: 'word',
      title: solo ? 'La palabra sellada' : 'La palabra del rival',
      body: 'Seis cartas tapan sus letras. Cada carta lleva una insignia, un símbolo o un color. Cumplir objetivos le pone marcadores y con 2 la letra se descubre.',
    },
    {
      target: 'cube',
      title: 'Un dado',
      body: 'La cara grande es la de arriba: es la que cuenta. La pequeña de encima es la que saldrá al voltearlo y las de los lados, sus caras laterales.',
    },
    {
      target: 'board',
      title: 'El tablero',
      body: solo
        ? 'En cada turno mueves exactamente 2 dados distintos. Los atenuados con ⊘ son los que moviste el turno anterior: ahora no puedes tocarlos.'
        : 'En cada turno mueves exactamente 2 dados distintos. Los atenuados con ⊘ los movió el rival en su turno: ahora no puedes tocarlos.',
    },
    {
      target: 'objectives',
      title: 'Los objetivos',
      body: solo
        ? 'Tres dados en fila o columna con el mismo símbolo o el mismo color cumplen el objetivo. Los marcados con ★ ya los has declarado y están en tu zona de bloqueo.'
        : 'Tres dados en fila o columna con el mismo símbolo o el mismo color cumplen el objetivo. ★: está en tu zona de bloqueo. ⊘: lo tiene el rival y no puedes usarlo.',
    },
  ];
  if (!solo) {
    steps.push({
      target: 'my-word',
      title: 'Tu palabra',
      body: 'Estas son las insignias de tus cartas. Cuando el rival cumple un objetivo marca tu carta con esa insignia: vigila qué alineaciones le dejas.',
    });
  }
  steps.push(
    {
      target: 'actions',
      title: 'La barra de acciones',
      body: 'Aquí verás qué toca hacer y los botones de cada momento: voltear, rotar, intercambiar, adivinar y acabar el turno.',
    },
    RULES_STEP
  );
  return steps;
}

export const TRACKER_TOUR: ReadonlyArray<TourStep> = [
  {
    target: 'word',
    title: 'La palabra secreta',
    body: 'La app ha escondido una palabra bajo seis cartas con las insignias de tu juego físico. Cada carta descubre su letra con 2 marcas.',
  },
  {
    target: 'counters',
    title: 'Tus objetivos',
    body: 'Juega con los dados en tu mesa. Cada vez que cumplas un objetivo pulsa ＋ en su contador; si te equivocaste, −.',
  },
  {
    target: 'guess',
    title: 'Adivinar',
    body: 'Con 4 letras descubiertas puedes arriesgar la palabra. Solo hay un intento: si fallas, pierdes.',
  },
  RULES_STEP,
];

export function tourDoneKey(kind: TourKind): string {
  return `tria-prima/tour-${kind}-done`;
}

export const SPOTLIGHT_PADDING = 6;
const BUBBLE_GAP = 12;

// El globo va debajo de la zona iluminada si ésta queda en la mitad superior
// de la pantalla y encima si queda en la inferior. Sin zona medida, centrado.
export type BubblePlacement = { top: number } | { bottom: number } | 'center';

export function bubblePlacement(rect: Rect | null, windowHeight: number): BubblePlacement {
  if (!rect) return 'center';
  const centerY = rect.y + rect.height / 2;
  if (centerY < windowHeight / 2) {
    return { top: rect.y + rect.height + SPOTLIGHT_PADDING + BUBBLE_GAP };
  }
  return { bottom: windowHeight - rect.y + SPOTLIGHT_PADDING + BUBBLE_GAP };
}

// Hueco iluminado: la zona más un margen, recortada a la ventana.
export function spotlightRect(rect: Rect, windowWidth: number, windowHeight: number): Rect {
  const x = Math.max(0, rect.x - SPOTLIGHT_PADDING);
  const y = Math.max(0, rect.y - SPOTLIGHT_PADDING);
  const right = Math.min(windowWidth, rect.x + rect.width + SPOTLIGHT_PADDING);
  const bottom = Math.min(windowHeight, rect.y + rect.height + SPOTLIGHT_PADDING);
  return { x, y, width: right - x, height: bottom - y };
}
