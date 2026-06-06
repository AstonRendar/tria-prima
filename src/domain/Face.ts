import { CubeColor } from './Color';
import { CubeSymbol } from './Symbol';

export type Face = { readonly symbol: CubeSymbol; readonly color: CubeColor };

export function equalsFace(a: Face, b: Face): boolean {
  return a.symbol === b.symbol && a.color === b.color;
}
