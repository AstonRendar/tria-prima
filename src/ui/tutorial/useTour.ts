import { useState } from 'react';
import { readFlag, writeFlag } from '@/ui/audio/preferences';
import { tourDoneKey, TourKind, TourStep } from './tourSteps';

// Avance del tour de presentación. Se muestra una sola vez por tipo (partida
// digital o juego físico) y `enabled` lo retiene hasta que la pantalla de
// juego está a la vista y es el turno del jugador.
export function useTour(kind: TourKind, steps: ReadonlyArray<TourStep>, enabled: boolean) {
  const [done, setDone] = useState(() => readFlag(tourDoneKey(kind), false));
  const [index, setIndex] = useState(0);

  const finish = () => {
    writeFlag(tourDoneKey(kind), true);
    setDone(true);
  };

  const next = () => {
    if (index + 1 >= steps.length) finish();
    else setIndex(index + 1);
  };

  const step = !done && enabled ? (steps[index] ?? null) : null;
  return { step, index, total: steps.length, active: !done, next, skip: finish };
}
