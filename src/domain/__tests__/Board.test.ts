import { Board, closeTurn, isLocked, rotateCubeAt, swapPositions } from '@/domain/Board';
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
    touchedThisTurn: [],
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

  it('rotateCubeAt records the moved cube', () => {
    const board = rotateCubeAt(buildBoard(), 3, 'spin-cw');
    expect(board.touchedThisTurn).toEqual([3]);
  });

  it('rotateCubeAt refuses to move the same cube twice in a turn', () => {
    const board = rotateCubeAt(buildBoard(), 3, 'roll-forward');
    expect(rotateCubeAt(board, 3, 'roll-forward')).toBe(board);
  });

  it('rotateCubeAt refuses a third cube in the same turn', () => {
    const board = rotateCubeAt(rotateCubeAt(buildBoard(), 0, 'spin-cw'), 1, 'spin-cw');
    expect(rotateCubeAt(board, 2, 'spin-cw')).toBe(board);
  });

  it('swapPositions records both cubes and is the only action of the turn', () => {
    const swapped = swapPositions(buildBoard(), 0, 2);
    expect(swapped.touchedThisTurn).toEqual([0, 2]);
    const afterRotation = rotateCubeAt(buildBoard(), 4, 'spin-cw');
    expect(swapPositions(afterRotation, 0, 2)).toBe(afterRotation);
  });

  it('swapPositions refuses to swap a cube with itself', () => {
    const board = buildBoard();
    expect(swapPositions(board, 4, 4)).toBe(board);
  });

  it('closeTurn locks the moved cubes for the next turn', () => {
    const board = rotateCubeAt(rotateCubeAt(buildBoard(), 2, 'spin-cw'), 5, 'spin-cw');
    const next = closeTurn(board);
    expect(next?.lockedThisTurn).toEqual([2, 5]);
    expect(next?.touchedThisTurn).toEqual([]);
  });

  it('closeTurn refuses a turn that did not move 2 cubes', () => {
    expect(closeTurn(rotateCubeAt(buildBoard(), 2, 'spin-cw'))).toBe(null);
  });

  it('isLocked checks lockedThisTurn only', () => {
    const board = buildBoard({ lockedThisTurn: [0], touchedThisTurn: [1] });
    expect(isLocked(board, 0)).toBe(true);
    expect(isLocked(board, 1)).toBe(false);
  });
});
