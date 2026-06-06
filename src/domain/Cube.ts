import { Face } from './Face';

export type CubeOrientation = {
  readonly top: Face;
  readonly bottom: Face;
  readonly front: Face;
  readonly back: Face;
  readonly left: Face;
  readonly right: Face;
};

export type Cube = {
  readonly id: number;
  readonly orientation: CubeOrientation;
};

export function topFace(cube: Cube): Face {
  return cube.orientation.top;
}

export function visibleFaces(cube: Cube): {
  top: Face;
  front: Face;
  back: Face;
  left: Face;
  right: Face;
} {
  const { top, front, back, left, right } = cube.orientation;
  return { top, front, back, left, right };
}

// Voltea el cubo hacia delante (hacia el oponente):
// la cara frontal va al fondo y arriba pasa a estar al frente.
// top → front, front → bottom, bottom → back, back → top
export function rollForward(cube: Cube): Cube {
  const { top, bottom, front, back, left, right } = cube.orientation;
  return {
    ...cube,
    orientation: { top: back, front: top, bottom: front, back: bottom, left, right },
  };
}

// Voltea el cubo hacia atrás (hacia el propio jugador):
// top → back, back → bottom, bottom → front, front → top
export function rollBackward(cube: Cube): Cube {
  const { top, bottom, front, back, left, right } = cube.orientation;
  return {
    ...cube,
    orientation: { top: front, front: bottom, bottom: back, back: top, left, right },
  };
}

// Rota el cubo sobre el eje vertical en sentido horario visto desde arriba
// (sin cambiar la cara superior).
// front → right, right → back, back → left, left → front
export function spinClockwise(cube: Cube): Cube {
  const { top, bottom, front, back, left, right } = cube.orientation;
  return {
    ...cube,
    orientation: { top, bottom, front: left, right: front, back: right, left: back },
  };
}

// Misma rotación en sentido antihorario.
export function spinCounterClockwise(cube: Cube): Cube {
  const { top, bottom, front, back, left, right } = cube.orientation;
  return {
    ...cube,
    orientation: { top, bottom, front: right, right: back, back: left, left: front },
  };
}

export type RotationKind = 'roll-forward' | 'roll-backward' | 'spin-cw' | 'spin-ccw';

export function applyRotation(cube: Cube, kind: RotationKind): Cube {
  switch (kind) {
    case 'roll-forward':
      return rollForward(cube);
    case 'roll-backward':
      return rollBackward(cube);
    case 'spin-cw':
      return spinClockwise(cube);
    case 'spin-ccw':
      return spinCounterClockwise(cube);
  }
}
