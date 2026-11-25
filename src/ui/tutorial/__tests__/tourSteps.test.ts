import {
  bubblePlacement,
  gameTourSteps,
  SPOTLIGHT_PADDING,
  spotlightRect,
  tourDoneKey,
  TRACKER_TOUR,
} from '@/ui/tutorial/tourSteps';

const targets = (steps: ReadonlyArray<{ target: string }>) => steps.map((s) => s.target);

describe('gameTourSteps', () => {
  it('walks the duel screen from the rival word to the rules', () => {
    expect(targets(gameTourSteps('duel'))).toEqual([
      'word',
      'cube',
      'board',
      'objectives',
      'my-word',
      'actions',
      'rules',
    ]);
  });

  it('has the same zones against the master', () => {
    expect(targets(gameTourSteps('versus'))).toEqual(targets(gameTourSteps('duel')));
  });

  it('skips the own word in the challenge, which has none', () => {
    expect(targets(gameTourSteps('solo'))).not.toContain('my-word');
    expect(gameTourSteps('solo')[0].title).toBe('La palabra sellada');
  });

  it('never talks about a rival in the challenge', () => {
    for (const step of gameTourSteps('solo')) {
      expect(step.body).not.toMatch(/rival/);
    }
  });

  it('gives every step a title and an explanation', () => {
    for (const step of [...gameTourSteps('duel'), ...gameTourSteps('solo'), ...TRACKER_TOUR]) {
      expect(step.title.length).toBeGreaterThan(0);
      expect(step.body.length).toBeGreaterThan(20);
    }
  });
});

describe('TRACKER_TOUR', () => {
  it('covers the word, the counters, guessing and the rules', () => {
    expect(targets(TRACKER_TOUR)).toEqual(['word', 'counters', 'guess', 'rules']);
  });
});

describe('tourDoneKey', () => {
  it('keeps a separate flag per tour', () => {
    expect(tourDoneKey('game')).not.toBe(tourDoneKey('tracker'));
  });
});

describe('bubblePlacement', () => {
  const height = 800;

  it('centres the bubble while the zone is not measured', () => {
    expect(bubblePlacement(null, height)).toBe('center');
  });

  it('puts the bubble below a zone in the upper half', () => {
    const rect = { x: 0, y: 100, width: 300, height: 60 };
    expect(bubblePlacement(rect, height)).toEqual({ top: 160 + SPOTLIGHT_PADDING + 12 });
  });

  it('puts the bubble above a zone in the lower half', () => {
    const rect = { x: 0, y: 700, width: 300, height: 80 };
    expect(bubblePlacement(rect, height)).toEqual({ bottom: 100 + SPOTLIGHT_PADDING + 12 });
  });
});

describe('spotlightRect', () => {
  it('adds a margin around the zone', () => {
    expect(spotlightRect({ x: 50, y: 50, width: 100, height: 40 }, 400, 800)).toEqual({
      x: 50 - SPOTLIGHT_PADDING,
      y: 50 - SPOTLIGHT_PADDING,
      width: 100 + 2 * SPOTLIGHT_PADDING,
      height: 40 + 2 * SPOTLIGHT_PADDING,
    });
  });

  it('clips the margin to the window edges', () => {
    expect(spotlightRect({ x: 0, y: 760, width: 400, height: 40 }, 400, 800)).toEqual({
      x: 0,
      y: 760 - SPOTLIGHT_PADDING,
      width: 400,
      height: 40 + SPOTLIGHT_PADDING,
    });
  });
});
