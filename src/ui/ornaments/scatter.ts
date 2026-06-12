export type Speck = {
  readonly cx: number;
  readonly cy: number;
  readonly r: number;
  readonly opacity: number;
};

// PRNG determinista (mulberry32): el moteado debe ser idéntico en cada
// render y entre plataformas, sin Math.random.
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function mottling(
  seed: number,
  count: number,
  width: number,
  height: number
): readonly Speck[] {
  const rand = mulberry32(seed);
  return Array.from({ length: count }, () => ({
    cx: rand() * width,
    cy: rand() * height,
    r: 0.4 + rand() * 1.6,
    opacity: 0.02 + rand() * 0.04,
  }));
}
