import {
  applyRotation,
  Cube,
  rollBackward,
  rollForward,
  spinClockwise,
  spinCounterClockwise,
  topFace,
  visibleFaces,
} from '@/domain/Cube';
import { Face } from '@/domain/Face';

const T: Face = { symbol: 'sulfur', color: 'nigredo' };
const Bo: Face = { symbol: 'sulfur', color: 'rubedo' };
const F: Face = { symbol: 'salt', color: 'nigredo' };
const Bk: Face = { symbol: 'salt', color: 'rubedo' };
const L: Face = { symbol: 'mercury', color: 'nigredo' };
const R: Face = { symbol: 'mercury', color: 'rubedo' };

function buildCube(): Cube {
  return {
    id: 1,
    orientation: { top: T, bottom: Bo, front: F, back: Bk, left: L, right: R },
  };
}

describe('Cube', () => {
  it('topFace returns the top face', () => {
    expect(topFace(buildCube())).toEqual(T);
  });

  it('visibleFaces returns top and 4 lateral faces (no bottom)', () => {
    const v = visibleFaces(buildCube());
    expect(v).toEqual({ top: T, front: F, back: Bk, left: L, right: R });
  });

  describe('rollForward', () => {
    it('moves front to bottom, top to front, bottom to back and back to top', () => {
      const next = rollForward(buildCube());
      expect(next.orientation.top).toEqual(Bk);
      expect(next.orientation.front).toEqual(T);
      expect(next.orientation.bottom).toEqual(F);
      expect(next.orientation.back).toEqual(Bo);
      expect(next.orientation.left).toEqual(L);
      expect(next.orientation.right).toEqual(R);
    });
  });

  describe('rollBackward', () => {
    it('is the inverse of rollForward', () => {
      const c = buildCube();
      expect(rollBackward(rollForward(c)).orientation).toEqual(c.orientation);
      expect(rollForward(rollBackward(c)).orientation).toEqual(c.orientation);
    });
  });

  describe('spinClockwise / spinCounterClockwise', () => {
    it('keeps top and bottom fixed', () => {
      const cw = spinClockwise(buildCube());
      const ccw = spinCounterClockwise(buildCube());
      expect(cw.orientation.top).toEqual(T);
      expect(cw.orientation.bottom).toEqual(Bo);
      expect(ccw.orientation.top).toEqual(T);
      expect(ccw.orientation.bottom).toEqual(Bo);
    });

    it('are inverses of each other', () => {
      const c = buildCube();
      expect(spinClockwise(spinCounterClockwise(c)).orientation).toEqual(c.orientation);
      expect(spinCounterClockwise(spinClockwise(c)).orientation).toEqual(c.orientation);
    });

    it('four clockwise spins return to original orientation', () => {
      const c = buildCube();
      const after = spinClockwise(spinClockwise(spinClockwise(spinClockwise(c))));
      expect(after.orientation).toEqual(c.orientation);
    });
  });

  it('applyRotation dispatches to the correct rotation', () => {
    const c = buildCube();
    expect(applyRotation(c, 'roll-forward').orientation).toEqual(rollForward(c).orientation);
    expect(applyRotation(c, 'spin-cw').orientation).toEqual(spinClockwise(c).orientation);
  });
});
