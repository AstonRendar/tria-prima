import { applyRotation, Cube, RotationKind } from '@/domain/Cube';
import { CUBE_SET, CUBES_PER_GAME } from '@/domain/CubeSet';
import { Random } from '@/infrastructure/Random';

const ALL_ROTATIONS: ReadonlyArray<RotationKind> = [
  'roll-forward',
  'roll-backward',
  'spin-cw',
  'spin-ccw',
];

// Construye los 9 cubos de la partida partiendo del set fijo y aplicando
// rotaciones aleatorias para que cada cubo aterrice con una pose distinta,
// emulando el "lanzar los dados al azar".
export function buildCubes(random: Random): Cube[] {
  const cubes: Cube[] = [];
  const placements = random.shuffle(CUBE_SET);
  for (let i = 0; i < CUBES_PER_GAME; i++) {
    const initial: Cube = { id: i, orientation: placements[i] };
    cubes.push(randomiseOrientation(initial, random));
  }
  return cubes;
}

function randomiseOrientation(cube: Cube, random: Random): Cube {
  const steps = 4 + random.pickIndex(8);
  let current = cube;
  for (let i = 0; i < steps; i++) {
    current = applyRotation(current, random.pick(ALL_ROTATIONS));
  }
  return current;
}

export { CUBES_PER_GAME };
