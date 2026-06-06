import { CubeOrientation } from './Cube';
import { Face } from './Face';

// Composición declarativa de los 9 cubos del juego.
//
// Símbolos (Tria Prima de Paracelso):
//   sulfur  → 🜍
//   mercury → ☿
//   salt    → 🜔
//
// Cada cara combina un símbolo con un color alquímico (nigredo, citrinitas,
// rubedo). Las cartas de objetivo son 6 fijas: una por símbolo + una por
// color (ver `Objective.ts`).

const SULFUR_N: Face = { symbol: 'sulfur', color: 'nigredo' };
const SULFUR_R: Face = { symbol: 'sulfur', color: 'rubedo' };
const SULFUR_C: Face = { symbol: 'sulfur', color: 'citrinitas' };
const SALT_N: Face = { symbol: 'salt', color: 'nigredo' };
const SALT_R: Face = { symbol: 'salt', color: 'rubedo' };
const SALT_C: Face = { symbol: 'salt', color: 'citrinitas' };
const MERCURY_N: Face = { symbol: 'mercury', color: 'nigredo' };
const MERCURY_R: Face = { symbol: 'mercury', color: 'rubedo' };
const MERCURY_C: Face = { symbol: 'mercury', color: 'citrinitas' };

export const CUBE_SET: ReadonlyArray<CubeOrientation> = [
  // 1 — todo nigredo: azufre arriba/abajo, sal delante/atrás, mercurio izq/der
  { top: SULFUR_N, bottom: SULFUR_N, front: SALT_N, back: SALT_N, left: MERCURY_N, right: MERCURY_N },
  // 2 — mismo dibujo en rubedo
  { top: SULFUR_R, bottom: SULFUR_R, front: SALT_R, back: SALT_R, left: MERCURY_R, right: MERCURY_R },
  // 3 — mismo dibujo en citrinitas
  { top: SULFUR_C, bottom: SULFUR_C, front: SALT_C, back: SALT_C, left: MERCURY_C, right: MERCURY_C },
  // 4 — mercurio rubedo arriba/abajo, azufre citrinitas delante/atrás, azufre rubedo izq/der
  { top: MERCURY_R, bottom: MERCURY_R, front: SULFUR_C, back: SULFUR_C, left: SULFUR_R, right: SULFUR_R },
  // 5 — sal citrinitas arriba/abajo, mercurio nigredo delante/atrás, mercurio citrinitas izq/der
  { top: SALT_C, bottom: SALT_C, front: MERCURY_N, back: MERCURY_N, left: MERCURY_C, right: MERCURY_C },
  // 6 — azufre nigredo arriba/abajo, sal rubedo delante/atrás, sal nigredo izq/der
  { top: SULFUR_N, bottom: SULFUR_N, front: SALT_R, back: SALT_R, left: SALT_N, right: SALT_N },
  // 7 — todo azufre: rubedo arriba/abajo, nigredo delante/atrás, citrinitas izq/der
  { top: SULFUR_R, bottom: SULFUR_R, front: SULFUR_N, back: SULFUR_N, left: SULFUR_C, right: SULFUR_C },
  // 8 — toda sal: rubedo arriba/abajo, nigredo delante/atrás, citrinitas izq/der
  { top: SALT_R, bottom: SALT_R, front: SALT_N, back: SALT_N, left: SALT_C, right: SALT_C },
  // 9 — todo mercurio: rubedo arriba/abajo, nigredo delante/atrás, citrinitas izq/der
  { top: MERCURY_R, bottom: MERCURY_R, front: MERCURY_N, back: MERCURY_N, left: MERCURY_C, right: MERCURY_C },
];

export const CUBES_PER_GAME = CUBE_SET.length;
