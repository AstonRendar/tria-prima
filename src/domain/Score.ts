export type Rank = 'genius' | 'beats-master' | 'keep-practising' | 'try-again';

export type RankInfo = { readonly rank: Rank; readonly label: string };

// Puntuación del modo solitario: 1 punto por turno jugado + 1 punto por cada
// objetivo cumplido ya en la disposición inicial. Cuanto menos, mejor.
export function computeScore(turns: number, initialFreeObjectives: number): number {
  return turns + initialFreeObjectives;
}

export function rankFor(score: number): RankInfo {
  if (score < 8) return { rank: 'genius', label: 'Genio. Paracelso te mira con respeto.' };
  if (score <= 10) {
    return { rank: 'beats-master', label: 'El alumno supera al maestro.' };
  }
  if (score <= 14) {
    return { rank: 'keep-practising', label: 'Hay algo especial en ti. Sigue practicando.' };
  }
  return { rank: 'try-again', label: 'Vuelve a intentarlo.' };
}
