import { useEffect, useState } from 'react';
import { readFlag, writeFlag } from '@/ui/audio/preferences';
import { tourDoneKey } from './tourSteps';
import { nextTutorialStep, TUTORIAL_STEPS, TutorialContext, TutorialStep, TutorialStepId } from './tutorialSteps';

export const TUTORIAL_DONE_KEY = 'tria-prima/tutorial-done';

// Vuelve a mostrar el tour de presentación y los consejos en la próxima partida.
export function resetTutorial(): void {
  writeFlag(TUTORIAL_DONE_KEY, false);
  writeFlag(tourDoneKey('game'), false);
  writeFlag(tourDoneKey('tracker'), false);
}

// Muestra los consejos del tutorial mientras el jugador no lo haya completado
// o saltado. `context` es null cuando no hay partida en curso.
export function useTutorial(context: TutorialContext | null) {
  const [active, setActive] = useState(() => !readFlag(TUTORIAL_DONE_KEY, false));
  const [seen, setSeen] = useState<ReadonlySet<TutorialStepId>>(new Set());
  const [current, setCurrent] = useState<TutorialStep | null>(null);

  const finish = () => {
    writeFlag(TUTORIAL_DONE_KEY, true);
    setActive(false);
    setCurrent(null);
  };

  useEffect(() => {
    if (!active || current || !context) return;
    const step = nextTutorialStep(context, seen);
    if (step) setCurrent(step);
  });

  const dismiss = () => {
    if (!current) return;
    const nextSeen = new Set(seen).add(current.id);
    setSeen(nextSeen);
    setCurrent(null);
    if (nextSeen.size === TUTORIAL_STEPS.length) finish();
  };

  return { step: active ? current : null, dismiss, skip: finish };
}
