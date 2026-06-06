import {
  allLines,
  colOf,
  colPositions,
  rowOf,
  rowPositions,
  sameRowOrColumn,
} from '@/domain/Position';

describe('Position', () => {
  describe('rowOf / colOf', () => {
    it.each([
      [0, 0, 0],
      [1, 0, 1],
      [2, 0, 2],
      [3, 1, 0],
      [4, 1, 1],
      [8, 2, 2],
    ])('position %i maps to row %i, col %i', (pos, row, col) => {
      expect(rowOf(pos)).toBe(row);
      expect(colOf(pos)).toBe(col);
    });
  });

  describe('sameRowOrColumn', () => {
    it('returns false when positions are equal', () => {
      expect(sameRowOrColumn(4, 4)).toBe(false);
    });

    it('returns true on shared row', () => {
      expect(sameRowOrColumn(3, 5)).toBe(true);
    });

    it('returns true on shared column', () => {
      expect(sameRowOrColumn(1, 7)).toBe(true);
    });

    it('returns false on diagonals or unrelated positions', () => {
      expect(sameRowOrColumn(0, 4)).toBe(false);
      expect(sameRowOrColumn(2, 6)).toBe(false);
    });
  });

  describe('row/col positions', () => {
    it('returns the three cells of a row', () => {
      expect(rowPositions(0)).toEqual([0, 1, 2]);
      expect(rowPositions(2)).toEqual([6, 7, 8]);
    });

    it('returns the three cells of a column', () => {
      expect(colPositions(0)).toEqual([0, 3, 6]);
      expect(colPositions(2)).toEqual([2, 5, 8]);
    });
  });

  describe('allLines', () => {
    it('returns 3 rows and 3 columns', () => {
      const lines = allLines();
      expect(lines).toHaveLength(6);
      expect(lines).toEqual(
        expect.arrayContaining([
          [0, 1, 2],
          [3, 4, 5],
          [6, 7, 8],
          [0, 3, 6],
          [1, 4, 7],
          [2, 5, 8],
        ])
      );
    });
  });
});
