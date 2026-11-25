import { WORDS_6 } from '@/infrastructure/WordRepository';

describe('word list', () => {
  it('only holds 6-letter words already normalized (A-Z and Ñ)', () => {
    const invalid = WORDS_6.filter((w) => !/^[A-ZÑ]{6}$/.test(w));
    expect(invalid).toEqual([]);
  });

  it('has no duplicates', () => {
    expect(new Set(WORDS_6).size).toBe(WORDS_6.length);
  });

  it('is sorted alphabetically', () => {
    const sorted = [...WORDS_6].sort((a, b) => a.localeCompare(b, 'es'));
    expect(WORDS_6).toEqual(sorted);
  });
});
