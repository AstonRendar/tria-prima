import { computeScore, rankFor } from '@/domain/Score';

describe('computeScore', () => {
  it('adds turns and initial free objectives', () => {
    expect(computeScore(6, 2)).toBe(8);
  });

  it('equals the turns played when no objective was free at start', () => {
    expect(computeScore(9, 0)).toBe(9);
  });
});

describe('rankFor', () => {
  it('ranks 7 or less as genius', () => {
    expect(rankFor(7).rank).toBe('genius');
  });

  it('ranks 8 to 10 as beats-master', () => {
    expect(rankFor(8).rank).toBe('beats-master');
    expect(rankFor(10).rank).toBe('beats-master');
  });

  it('ranks 11 to 14 as keep-practising', () => {
    expect(rankFor(11).rank).toBe('keep-practising');
    expect(rankFor(14).rank).toBe('keep-practising');
  });

  it('ranks 15 or more as try-again', () => {
    expect(rankFor(15).rank).toBe('try-again');
  });

  it('attaches a non-empty label to every rank', () => {
    for (const score of [5, 9, 12, 20]) {
      expect(rankFor(score).label.length).toBeGreaterThan(0);
    }
  });
});
