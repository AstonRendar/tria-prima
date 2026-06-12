import { ALL_COLORS } from '@/domain/Color';
import { CubeOrientation } from '@/domain/Cube';
import { CUBE_SET, CUBES_PER_GAME } from '@/domain/CubeSet';
import { equalsFace } from '@/domain/Face';
import { ALL_SYMBOLS } from '@/domain/Symbol';

function facesOf(orientation: CubeOrientation) {
  const { top, bottom, front, back, left, right } = orientation;
  return [top, bottom, front, back, left, right];
}

describe('CUBE_SET', () => {
  it('declares exactly the 9 cubes of a game', () => {
    expect(CUBE_SET).toHaveLength(9);
    expect(CUBES_PER_GAME).toBe(9);
  });

  it('defines six valid faces on every cube', () => {
    for (const orientation of CUBE_SET) {
      for (const face of facesOf(orientation)) {
        expect(ALL_SYMBOLS).toContain(face.symbol);
        expect(ALL_COLORS).toContain(face.color);
      }
    }
  });

  it('pairs opposite faces with the same design', () => {
    for (const o of CUBE_SET) {
      expect(equalsFace(o.top, o.bottom)).toBe(true);
      expect(equalsFace(o.front, o.back)).toBe(true);
      expect(equalsFace(o.left, o.right)).toBe(true);
    }
  });
});
