import { buildCubes } from '@/application/CubeFactory';
import { CubeOrientation } from '@/domain/Cube';
import { CUBE_SET } from '@/domain/CubeSet';
import { Face } from '@/domain/Face';
import { StubRandom } from './testdoubles';

// Las rotaciones permutan caras sin cambiarlas: el multiconjunto de caras de
// cada cubo identifica de qué cubo del set procede.
function designOf(orientation: CubeOrientation): string {
  const { top, bottom, front, back, left, right } = orientation;
  return [top, bottom, front, back, left, right]
    .map((f: Face) => `${f.symbol}:${f.color}`)
    .sort()
    .join('|');
}

describe('buildCubes', () => {
  it('produces the 9 cubes of the game with sequential ids', () => {
    const cubes = buildCubes(new StubRandom([0.1, 0.5, 0.9]));
    expect(cubes).toHaveLength(9);
    expect(cubes.map((c) => c.id)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('only re-orients the cubes, preserving the face design of the set', () => {
    const cubes = buildCubes(new StubRandom([0.13, 0.42, 0.77, 0.31]));
    const expected = CUBE_SET.map(designOf).sort();
    expect(cubes.map((c) => designOf(c.orientation)).sort()).toEqual(expected);
  });
});
