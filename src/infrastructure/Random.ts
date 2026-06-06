export interface Random {
  next(): number;
  pickIndex(size: number): number;
  pick<T>(items: ReadonlyArray<T>): T;
  shuffle<T>(items: ReadonlyArray<T>): T[];
}

export class DefaultRandom implements Random {
  next(): number {
    return Math.random();
  }
  pickIndex(size: number): number {
    return Math.floor(this.next() * size);
  }
  pick<T>(items: ReadonlyArray<T>): T {
    return items[this.pickIndex(items.length)];
  }
  shuffle<T>(items: ReadonlyArray<T>): T[] {
    const out = items.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = this.pickIndex(i + 1);
      const tmp = out[i];
      out[i] = out[j];
      out[j] = tmp;
    }
    return out;
  }
}
