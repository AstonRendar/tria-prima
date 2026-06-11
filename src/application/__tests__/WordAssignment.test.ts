import { buildAssignments } from '@/application/WordAssignment';
import { StubRandom } from './testdoubles';

describe('buildAssignments', () => {
  it('pairs each letter with a distinct face sign', () => {
    const assignments = buildAssignments('CAMINO'.split(''), new StubRandom([0]));
    expect(assignments.map((a) => a.letter)).toEqual(['C', 'A', 'M', 'I', 'N', 'O']);
    const signs = assignments.map((a) => `${a.faceSign.kind}:${a.faceSign.value}`);
    expect(new Set(signs).size).toBe(6);
  });

  it('rejects words that do not have 6 letters', () => {
    expect(() => buildAssignments(['S', 'O', 'L'], new StubRandom([0]))).toThrow();
  });
});
