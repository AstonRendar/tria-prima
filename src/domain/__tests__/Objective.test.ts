import { Board } from '@/domain/Board';
import { Cube } from '@/domain/Cube';
import { Face } from '@/domain/Face';
import {
  ALL_OBJECTIVES,
  buildInitialObjectiveSlots,
  findAllSatisfied,
  findMatchedLine,
  Objective,
  ObjectiveSlot,
} from '@/domain/Objective';

function cubeWithTopFace(id: number, top: Face): Cube {
  return {
    id,
    orientation: {
      top,
      bottom: top,
      front: { symbol: 'mercury', color: 'citrinitas' },
      back: { symbol: 'mercury', color: 'citrinitas' },
      left: { symbol: 'mercury', color: 'citrinitas' },
      right: { symbol: 'mercury', color: 'citrinitas' },
    },
  };
}

function buildBoardWithTopFaces(faces: Face[]): Board {
  return {
    cubes: faces.map((f, i) => cubeWithTopFace(i, f)),
    lockedThisTurn: [],
    lockedNextTurn: [],
  };
}

describe('Objective', () => {
  it('ALL_OBJECTIVES contains exactly 6 entries (3 symbols + 3 colors)', () => {
    expect(ALL_OBJECTIVES).toHaveLength(6);
    expect(ALL_OBJECTIVES.filter((o) => o.kind === 'symbol')).toHaveLength(3);
    expect(ALL_OBJECTIVES.filter((o) => o.kind === 'color')).toHaveLength(3);
  });

  it('buildInitialObjectiveSlots starts all 6 objectives as available', () => {
    const slots = buildInitialObjectiveSlots();
    expect(slots).toHaveLength(6);
    expect(slots.every((s) => s.blockedBy === null)).toBe(true);
  });

  describe('findMatchedLine', () => {
    it('detects a matching row by symbol', () => {
      const board = buildBoardWithTopFaces([
        { symbol: 'sulfur', color: 'nigredo' },
        { symbol: 'sulfur', color: 'rubedo' },
        { symbol: 'sulfur', color: 'citrinitas' },
        { symbol: 'salt', color: 'nigredo' },
        { symbol: 'mercury', color: 'nigredo' },
        { symbol: 'salt', color: 'rubedo' },
        { symbol: 'mercury', color: 'citrinitas' },
        { symbol: 'salt', color: 'citrinitas' },
        { symbol: 'mercury', color: 'rubedo' },
      ]);
      const obj: Objective = { id: 'sym:sulfur', kind: 'symbol', value: 'sulfur' };
      expect(findMatchedLine(board, obj)).toEqual([0, 1, 2]);
    });

    it('detects a matching column by color', () => {
      const board = buildBoardWithTopFaces([
        { symbol: 'sulfur', color: 'rubedo' },
        { symbol: 'salt', color: 'nigredo' },
        { symbol: 'mercury', color: 'citrinitas' },
        { symbol: 'salt', color: 'rubedo' },
        { symbol: 'mercury', color: 'nigredo' },
        { symbol: 'sulfur', color: 'citrinitas' },
        { symbol: 'mercury', color: 'rubedo' },
        { symbol: 'sulfur', color: 'nigredo' },
        { symbol: 'salt', color: 'citrinitas' },
      ]);
      const obj: Objective = { id: 'col:rubedo', kind: 'color', value: 'rubedo' };
      expect(findMatchedLine(board, obj)).toEqual([0, 3, 6]);
    });

    it('returns null when no line matches', () => {
      const board = buildBoardWithTopFaces([
        { symbol: 'sulfur', color: 'rubedo' },
        { symbol: 'salt', color: 'citrinitas' },
        { symbol: 'mercury', color: 'nigredo' },
        { symbol: 'salt', color: 'citrinitas' },
        { symbol: 'mercury', color: 'rubedo' },
        { symbol: 'sulfur', color: 'citrinitas' },
        { symbol: 'mercury', color: 'nigredo' },
        { symbol: 'sulfur', color: 'nigredo' },
        { symbol: 'salt', color: 'rubedo' },
      ]);
      const obj: Objective = { id: 'sym:salt', kind: 'symbol', value: 'salt' };
      expect(findMatchedLine(board, obj)).toBeNull();
    });
  });

  it('findAllSatisfied returns only available matched slots', () => {
    const board = buildBoardWithTopFaces([
      { symbol: 'sulfur', color: 'nigredo' },
      { symbol: 'sulfur', color: 'rubedo' },
      { symbol: 'sulfur', color: 'citrinitas' },
      { symbol: 'salt', color: 'rubedo' },
      { symbol: 'mercury', color: 'rubedo' },
      { symbol: 'sulfur', color: 'rubedo' },
      { symbol: 'mercury', color: 'citrinitas' },
      { symbol: 'salt', color: 'citrinitas' },
      { symbol: 'mercury', color: 'nigredo' },
    ]);
    const slots: ObjectiveSlot[] = [
      {
        objective: { id: 'sym:sulfur', kind: 'symbol', value: 'sulfur' },
        blockedBy: null,
      },
      {
        objective: { id: 'col:rubedo', kind: 'color', value: 'rubedo' },
        blockedBy: 'p1',
      },
      {
        objective: { id: 'sym:salt', kind: 'symbol', value: 'salt' },
        blockedBy: null,
      },
    ];
    const matched = findAllSatisfied(board, slots);
    expect(matched.map((m) => m.objective.id)).toEqual(['sym:sulfur']);
  });
});
