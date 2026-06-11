import { equalsFace, Face } from '@/domain/Face';

const SULFUR_N: Face = { symbol: 'sulfur', color: 'nigredo' };

describe('equalsFace', () => {
  it('matches when symbol and color are equal', () => {
    expect(equalsFace(SULFUR_N, { symbol: 'sulfur', color: 'nigredo' })).toBe(true);
  });

  it('differs when the symbol differs', () => {
    expect(equalsFace(SULFUR_N, { symbol: 'salt', color: 'nigredo' })).toBe(false);
  });

  it('differs when the color differs', () => {
    expect(equalsFace(SULFUR_N, { symbol: 'sulfur', color: 'rubedo' })).toBe(false);
  });
});
