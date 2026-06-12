# Tria Prima

Juego de deducción para móvil (iOS, Android y web) inspirado en las mecánicas del juego
de mesa **Kryptex** (José Joaquín Bernal, ed. Zacatrus). Tria Prima es un proyecto
independiente: los textos, los iconos, la paleta y la presentación son obra propia, y la
app incluye un enlace de apoyo al juego original como reconocimiento al autor.

Dos jugadores esconden una palabra de 6 letras. Manipulando 9 dados alquímicos en una
cuadrícula 3×3 (símbolos 🜍 ☿ 🜔 × colores nigredo / citrinitas / rubedo), se declaran
alineaciones que van marcando las cartas del rival; cada dos marcadores, una letra se
revela. Con cuatro letras a la vista, puedes intentar descifrar la palabra: acierta y
ganas, falla y pierdes.

## Modos de juego

| Modo | Ruta | Descripción |
|---|---|---|
| **Duelo a dos** | `/play` | Dos personas comparten dispositivo y juegan turnos alternos. |
| **Contra el maestro** | `/versus` | Duelo contra la app: planifica sus turnos, declara y adivina usando solo información pública. |
| **Desafío** | `/solo` | Solitario digital con puntuación por turnos. |
| **Con el juego físico** | `/tracker` | Acompañante para jugar con el juego de mesa real: lleva marcadores y letras reveladas. |

## Stack

- **React Native** + **TypeScript** + **Expo** (managed workflow, `expo-router`).
- 100 % offline: sin backend ni red.
- Arquitectura por capas: `domain` (reglas puras) → `application` (casos de uso) →
  `ui` / `infrastructure`. Detalle completo en [AGENTS.md](./AGENTS.md).

## Desarrollo

```bash
npm install
npx expo start          # servidor de desarrollo (web + Metro)
npx expo start --ios    # simulador iOS
npx expo start --android
```

## Tests

```bash
npm test                # toda la suite (lógica + UI)
npm run test:watch
npm run typecheck
```

Jest en multi-proyecto: **logic** (ts-jest, tests unitarios y funcionales de dominio y
aplicación) y **ui** (jest-expo + Testing Library, smoke tests de pantallas).

## Flujo de trabajo

Git flow: `main` (releases) ← `release/*` ← `develop` ← `feature/*`. El trabajo diario
se integra en `develop` mediante merges `--no-ff`.

## Propiedad intelectual

Este repositorio no contiene gráficos, textos ni nombres del juego original más allá de
la atribución. Si te gusta la mecánica, [apoya al autor comprando Kryptex](https://zacatrus.es/kryptex.html).
