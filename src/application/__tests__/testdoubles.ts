import { Random } from '@/infrastructure/Random';
import { WordRepository } from '@/infrastructure/WordRepository';

export class StubRandom implements Random {
  private cursor = 0;
  constructor(private readonly values: number[]) {}
  next(): number {
    const v = this.values[this.cursor % this.values.length];
    this.cursor++;
    return v;
  }
  pickIndex(size: number): number {
    return Math.floor(this.next() * size);
  }
  pick<T>(items: ReadonlyArray<T>): T {
    return items[this.pickIndex(items.length)];
  }
  shuffle<T>(items: ReadonlyArray<T>): T[] {
    return items.slice();
  }
}

export class StubWordRepository implements WordRepository {
  constructor(private readonly word: string) {}
  randomWord(): string {
    return this.word;
  }
}
