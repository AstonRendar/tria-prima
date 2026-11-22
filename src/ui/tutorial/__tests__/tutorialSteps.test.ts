import { nextTutorialStep, TutorialContext, TutorialStepId } from '@/ui/tutorial/tutorialSteps';

const base: TutorialContext = {
  isMyTurn: true,
  phase: 'select-cube',
  touchedCount: 0,
  hasLockedCubes: false,
  anyMarker: false,
  canGuess: false,
};

const seen = (...ids: TutorialStepId[]) => new Set<TutorialStepId>(ids);

describe('nextTutorialStep', () => {
  it('starts by explaining the goal', () => {
    expect(nextTutorialStep(base, seen())?.id).toBe('goal');
  });

  it('shows nothing while it is not the player turn', () => {
    expect(nextTutorialStep({ ...base, isMyTurn: false }, seen())).toBe(null);
  });

  it('explains the actions once a cube is selected', () => {
    const step = nextTutorialStep({ ...base, phase: 'choose-action' }, seen('goal', 'select'));
    expect(step?.id).toBe('actions');
  });

  it('asks for a second, different cube after the first move', () => {
    const step = nextTutorialStep({ ...base, touchedCount: 1 }, seen('goal', 'select', 'actions'));
    expect(step?.id).toBe('second-cube');
  });

  it('explains locked cubes when the rival left some', () => {
    const step = nextTutorialStep({ ...base, hasLockedCubes: true }, seen('goal', 'select'));
    expect(step?.id).toBe('locked');
  });

  it('explains guessing when it becomes possible', () => {
    const all = seen('goal', 'select', 'actions', 'second-cube', 'declare', 'locked', 'markers');
    expect(nextTutorialStep({ ...base, phase: 'declare', canGuess: true }, all)?.id).toBe('guess');
  });

  it('never repeats a step already seen', () => {
    expect(nextTutorialStep(base, seen('goal', 'select'))).toBe(null);
  });
});
