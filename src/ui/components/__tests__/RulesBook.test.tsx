import { render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { RULE_SECTIONS, RulesBook, splitColorWords } from '@/ui/components/RulesBook';
import { cubeColorHex } from '@/ui/styles/tokens';

describe('splitColorWords', () => {
  it('separates the colour names from the rest of the text', () => {
    expect(splitColorWords('los colores (nigredo, citrinitas o rubedo).')).toEqual([
      { text: 'los colores (' },
      { text: 'nigredo', color: 'nigredo' },
      { text: ', ' },
      { text: 'citrinitas', color: 'citrinitas' },
      { text: ' o ' },
      { text: 'rubedo', color: 'rubedo' },
      { text: ').' },
    ]);
  });

  it('recognises a capitalised name and leaves plain text untouched', () => {
    expect(splitColorWords('Rubedo')).toEqual([{ text: 'Rubedo', color: 'rubedo' }]);
    expect(splitColorWords('sin colores')).toEqual([{ text: 'sin colores' }]);
  });
});

describe('RulesBook', () => {
  it('writes every colour name in bold and in its own colour', async () => {
    await render(<RulesBook />);
    for (const color of ['nigredo', 'citrinitas', 'rubedo'] as const) {
      const words = screen.getAllByTestId(`rules/color/${color}`);
      expect(words.length).toBeGreaterThan(0);
      for (const word of words) {
        const style = StyleSheet.flatten(word.props.style);
        expect(style.color).toBe(cubeColorHex[color]);
        expect(style.fontWeight).toBe('800');
      }
    }
  });

  it('no longer explains the colours with plain colour words', () => {
    const text = RULE_SECTIONS.map((s) => s.body).join(' ');
    expect(text).not.toMatch(/nigredo negro|citrinitas oro|rubedo rojo/);
  });
});
