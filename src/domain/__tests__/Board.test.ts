import {
  advanceLocks,
  Board,
  isLocked,
  lockTouchedCubes,
  rotateCubeAt,
  swapPositions,
} from '@/domain/Board';
import { Cube } from '@/domain/Cube';
import { Face } from '@/domain/Face';

const T: Face = { symbol: 'sulfur', color: 'nigredo' };
const Bo: Face = { symbol: 'sulfur', color: 'rubedo' };
const F: Face = { symbol: 'salt', color: 'nigredo' };
const Bk: Face = { symbol: 'salt', color: 'rubedo' };
const L: Face = { symbol: 'mercury', color: 'nigredo' };
const R: Face = { symbol: 'mercury', color: 'rubedo' };

function buildCube(id: number): Cube {
  return {
    id,
    orientation: { top: T, bottom: Bo, front: F, back: Bk, left: L, right: R },
  };
}

function buildBoard(overrides: Partial<Board> = {}): Board {
  const cubes: Cube[] = [];
  for (let i = 0; i < 9; i++) cubes.push(buildCube(i));
  return {
    cubes,
    lockedThisTurn: [],
    lockedNextTurn: [],
    ...overrides,
  };
}

describe('Board', () => {
  it('swapPositions swaps two cubes in the same row', () => {
    const board = buildBoard();
    const swapped = swapPositions(board, 0, 2);
    expect(swapped.cubes[0].id).toBe(2);
    expect(swapped.cubes[2].id).toBe(0);
  });

  it('swapPositions swaps two cubes in the same column', () => {
    const board = buildBoard();
    const swapped = swapPositions(board, 1, 7);
    expect(swapped.cubes[1].id).toBe(7);
    expect(swapped.cubes[7].id).toBe(1);
  });

  it('swapPositions does nothing when positions are not aligned', () => {
    const board = buildBoard();
    expect(swapPositions(board, 0, 4)).toBe(board);
  });

  it('swapPositions does nothing when one cube is locked', () => {
    const board = buildBoard({ lockedThisTurn: [0] });
    expect(swapPositions(board, 0, 2)).toBe(board);
  });

  it('rotateCubeAt applies the given rotation to the target cube only', () => {
    const board = buildBoard();
    const rotated = rotateCubeAt(board, 3, 'roll-forward');
    expect(rotated.cubes[3].orientation.top).toEqual(Bk);
    expect(rotated.cubes[0].orientation.top).toEqual(T);
  });

  it('rotateCubeAt does nothing when the cube is locked', () => {
    const board = buildBoard({ lockedThisTurn: [3] });
    expect(rotateCubeAt(board, 3, 'roll-forward')).toBe(board);
  });

  it('lockTouchedCubes stores deduped positions for next turn', () => {
    const board = buildBoard();
    const locked = lockTouchedCubes(board, [1, 4, 1, 4]);
    expect(locked.lockedNextTurn).toEqual([1, 4]);
  });

  it('advanceLocks promotes lockedNextTurn to lockedThisTurn', () => {
    const board = buildBoard({ lockedNextTurn: [2, 5] });
    const next = advanceLocks(board);
    expect(next.lockedThisTurn).toEqual([2, 5]);
    expect(next.lockedNextTurn).toEqual([]);
  });

  it('isLocked checks lockedThisTurn only', () => {
    const board = buildBoard({ lockedThisTurn: [0], lockedNextTurn: [1] });
    expect(isLocked(board, 0)).toBe(true);
    expect(isLocked(board, 1)).toBe(false);
  });
});
