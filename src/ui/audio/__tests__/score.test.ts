import { loopBeatsOf, SCORES } from '../score';

describe('SCORES', () => {
  it.each(Object.entries(SCORES))('keeps the %s score consistent', (_, score) => {
    expect(score.barChord).toHaveLength(score.bars);
    for (const index of score.barChord) {
      expect(score.chords[index]).toBeDefined();
    }
    for (const degree of score.arpPattern) {
      expect(degree).toBeGreaterThanOrEqual(0);
      expect(degree).toBeLessThan(3);
    }
    for (const [, start, duration] of score.melody) {
      expect(start + duration).toBeLessThanOrEqual(loopBeatsOf(score));
    }
  });

  it('gives menu and game distinct melodies', () => {
    expect(SCORES.game.melody).not.toEqual(SCORES.menu.melody);
  });
});
