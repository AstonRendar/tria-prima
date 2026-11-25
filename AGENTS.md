# Tria Prima — Contexto del proyecto

## Identidad

**Tria Prima** es una aplicación independiente para móvil (iOS y Android), inspirada en
el juego de mesa físico **Kryptex** (autor: José Joaquín Bernal; editorial: Zacatrus). Las
mecánicas son las del juego original; los textos, los iconos, la paleta y la presentación
son obra propia para evitar uso indebido de propiedad intelectual ajena.

### Reglas de propiedad intelectual que aplican
1. **Nombre**: el proyecto **no** se llama "Kryptex". La app es "Tria Prima".
2. **Gráficos**: no se incluyen logos, capturas, ilustraciones ni el arte de la caja del
   juego original. Los iconos son símbolos alquímicos genéricos (🜍 ☿ 🜔) y la paleta
   (nigredo, citrinitas, rubedo) viene de las fases clásicas de la Gran Obra.
3. **Textos**: el manual y los textos de UI están redactados con vocabulario propio.
4. **Atribución**: el footer incluye un enlace al juego original con un mensaje de
   "apoya al autor". Está pensado como reconocimiento, no como afiliación.

## Descripción

App móvil con cuatro modos. **Contra el maestro** es el modo principal: va primero y
destacado en la home.

1. **Contra el maestro** (`/versus`) — duelo contra la app. El humano es p1 y la app
   (p2, "El maestro") esconde una palabra de la lista y juega sus turnos sola:
   planifica con búsqueda voraz, declara y adivina usando solo información pública
   (letras reveladas + lista de palabras). Sin handoff: los pasos de la app se
   reproducen con retardo para que se vea la jugada.
2. **Duelo a dos** (`/play`) — dos personas comparten un dispositivo y juegan turnos
   alternos. Cada una introduce su palabra clave de 6 letras al inicio y trata de
   descifrar la del rival manipulando 9 cubos compartidos en una cuadrícula 3×3.
3. **Desafío** (`/solo`) — un solo jugador contra la app. La app esconde una
   palabra y gestiona todo el juego digitalmente: el jugador manipula los cubos en
   pantalla, declara automáticamente al cerrar la fase de movimiento y la app
   coloca los marcadores y calcula la puntuación final.
4. **Con el juego físico** (`/tracker`) — *tracker* para jugar con el juego de mesa
   en la mesa. La app esconde una palabra y lleva la cuenta de marcadores; el
   jugador manipula los cubos en la mesa real y pulsa ＋/− por cada objetivo
   cumplido o desecho.

## Stack tecnológico

### Framework
- **React Native** + **TypeScript**
- **Expo** (managed workflow)
- **expo-router** — routing basado en ficheros (`app/`)
- **react-native-svg** — arte vectorial de la capa de ornamentos (`src/ui/ornaments/`)

### Plataformas
- iOS (iPhone)
- Android
- Web (modo desarrollo / despliegue secundario)

### Almacenamiento
- 100 % offline. Sin backend ni red.

## Arquitectura

Arquitectura por capas inspirada en DDD, aplicada con criterio (KISS/YAGNI): funciones
puras y tipos, sin clases ni patrones ceremoniales cuando no aportan.

```
ui ──▶ application ──▶ domain
            │
            └─▶ infrastructure (interfaces implementadas)
```

### `src/domain/` — Núcleo del juego (puro)
Sin React, sin Math.random, sin I/O. Tipos `readonly`. Funciones devuelven nuevos objetos.

- **Value objects:** `Symbol`, `Color`, `Face`, `Position`, `Player` (`PlayerId`).
- **Entidades:** `Cube` (con `CubeOrientation`), `Board`, `Objective`, `ObjectiveSlot`,
  `SecretWord` (con `PlayerCard`).
- **Reglas puras:** rotaciones del cubo (`rollForward`, `rollBackward`, `spinClockwise`,
  `spinCounterClockwise`), `swapPositions`, `findMatchedLine`, `addMarkerForObjective`,
  `normalizeGuess`, `matchesGuess`.
- **Datos fijos:** `CubeSet` declara la composición exacta de los 9 cubos.

### `src/application/` — Casos de uso
Orquestan el dominio. Cada caso de uso recibe el `state` (y `Dependencies` si necesita
aleatoriedad o repositorios) y devuelve nuevo `state`.

Modo duelo (2 jugadores):
- `MatchState` (con dos `PlayerData`, currentPlayerId, board, objectives compartidos).
- `StartMatch`, `RotateMatchCube`, `SwapMatchCubes`, `EndMatchTurn`,
  `DeclareMatchObjectives`, `GuessMatchWord`.
- El setup permite elegir quién empieza (`firstPlayer: 'p1' | 'p2' | 'random'`,
  por defecto `random`). Aplica al duelo y al modo contra el maestro (vía
  `VersusSetup`); en solitario y tracker no hay rival, no aplica.

Modo contra el maestro (humano vs app, reutiliza `MatchState` y los casos de uso del duelo):
- `StartVersus` — `startVersusMatch`: p1 humano, p2 la app con palabra del repositorio.
- `AppOpponent` — `planAppTurn` (búsqueda voraz sobre todos los turnos legales,
  +1 por objetivo declarable, +1 si revela letra, y en negativo las líneas que el
  rival mantiene bloqueadas mientras sigan formadas, con −1 extra si re-declararlas
  revelaría letra propia; empata al azar) y `chooseAppGuess`
  (solo información pública: 6 reveladas → palabra exacta; con 5 reveladas, 1 candidata →
  la arriesga y varias → una al azar; con 4 no se fía, porque la palabra del rival puede
  no estar en la lista). En el primer turno (no puede declarar) toda línea que deje
  formada resta, porque la aprovecharía el rival. Dos niveles (`AppLevel`):
  **maestro** (siempre la mejor jugada) y **aprendiz** (50 % de despiste con jugada
  aleatoria; solo arriesga la única candidata con 5+ letras).
  La adivinanza va al final del turno, tras declarar, y solo si en ese turno ha revelado
  letra (misma regla que el humano). El nivel se elige en el
  setup y viaja en `VersusSetup`.
- `PlayAppTurn` — `buildAppTurnSteps` / `applyAppStep` / `playAppTurn`: el turno de la
  app como lista de pasos que la UI reproduce con retardo. Cada acción va precedida
  de pasos `select` (no-op en el estado; dos en un intercambio) que la UI remarca y anima
  como si el dado lo hubiera tocado un humano. Mientras juega el maestro (no es el turno del humano),
  un velo translúcido (`versus/master-veil`) cubre el tablero y bloquea los toques, y la
  barra de acciones dice que el maestro está jugando.

Modo solitario digital (1 jugador, todo en la app):
- `SoloPlayState` (board, objectives, palabra elegida por la app, turno, puntuación).
- `StartSoloPlay`, `RotateSoloCube`, `SwapSoloCubes`, `EndSoloTurn`,
  `DeclareSoloObjectives`, `GuessSoloWord`.

Modo tracker (jugando con el juego físico):
- `TrackerState` (una palabra escondida, contador de declaraciones por objetivo).
- `StartTracker`, `MarkObjective` (`markObjective` / `unmarkObjective`),
  `TrackerActions` (`guessTracker`).

Comunes:
- `Dependencies` (`Random` + `WordRepository`).
- `CubeFactory` — reparte los 9 cubos del `CubeSet` con orientación aleatoria.
- `WordAssignment` — empareja las 6 letras de una palabra con los 6 faceSigns.

### `src/infrastructure/`
- `Random` — interfaz + `DefaultRandom`.
- `WordRepository` — interfaz (`randomWord` + `allWords`) + `InMemoryWordRepository`
  (lista de palabras de 6 letras en castellano). **Norma de contenido**: el vocabulario
  debe ser apto para todos los públicos — prohibido añadir insultos, palabras malsonantes,
  sexuales o inapropiadas. Las palabras se guardan ya normalizadas (mayúsculas, sin
  tildes, solo A–Z y Ñ) y ordenadas alfabéticamente.
- `ProductionDependencies` — factoría del bundle real.

### `src/ui/`
- `components/` — átomos de UI (`CubeView`, `FaceTile`, `ObjectiveRail`, `ObjectiveCounter`, `WordTrack`, `SignCounters`, `SignGlyph`, `RevealFlip`, `ActionButton`,
  `ConfirmDialog`, `EndScreen`, `FlashMessage`, `GuessBox`, `GuessSheet`, `Footer`,
  `SetupScreen`, `CubeGrid`, `TurnActions`, `RulesBook` —las reglas, compartidas por la
  pantalla de reglas y el panel en partida; se redactan en términos de la app y todo el
  manejo físico (componentes, preparación, anillos, marcadores a mano) va solo en la
  sección «Si tienes el juego de mesa», tras el modo «Con el juego físico»
  (decisión del 2026-11-25)— y `RulesButton` —botón «?» de la cabecera que
  abre las reglas en un modal sin salir de la partida—).
- **Disposición compacta de partida** (todo en una pantalla, sin plegables): una línea
  de estado (de quién es el turno; no hay botón de nueva partida: se sale con la flecha o
  el botón atrás, que piden confirmación, y la pantalla final ofrece «Nueva partida» y
  «Volver al inicio»), la palabra del rival en una sola fila (`WordTrack
  compact`, sin repetirla como texto), la zona de bloqueo del rival (`LockZone`), el
  tablero con `ObjectiveRail` al lado (columna de los seis objetivos centrada respecto a
  los dados; el declarado deja un hueco punteado, sin iconos de estado), tu zona de
  bloqueo y la palabra propia en una fila: como en la mesa, cada carta declarada está
  del lado de quien la declaró, entre los dados y su palabra. El contenido se centra en
  vertical. Debajo,
  fuera del scroll, `TurnActions` es una barra fija de altura constante con la ayuda de
  la fase y los botones; en la fase de declarar ofrece «Adivinar» cuando la regla lo
  permite y abre `GuessSheet` (modal con `GuessBox`), así la casilla nunca queda fuera
  de pantalla. El pie de atribución solo está en la home, las reglas y las pantallas de
  preparación. El modo físico sigue la misma idea: palabra arriba, los 6 contadores en
  cuadrícula 2×3 (`ObjectiveCounter compact`) y una barra fija con «Adivinar la palabra».
- Accesibilidad: dados, cartas de objetivo y cartas de palabra llevan `accessibilityLabel`
  con su estado (cara superior y la que saldría al voltear; objetivo y si está
  bloqueado; insignia y letra o marcadores). Sirven a lectores de pantalla y permiten
  leer la partida con `uiautomator` al probar en un móvil.
- `GuessBox` solo envía con exactamente 6 letras (contador visible), también con Intro, y
  siempre pide confirmación. En Android `softwareKeyboardLayoutMode: pan` evita que el
  teclado tape la casilla.
- `tutorial/` — tutorial de la primera partida (versus, duelo y desafío; no en el modo
  físico): `tutorialSteps.ts` define los consejos y cuándo aplican (`nextTutorialStep`,
  puro y testeado en el proyecto logic), `useTutorial` los muestra uno a uno y
  `TutorialTip` los pinta arriba sin tapar el tablero ni el panel de acciones. Al verlos todos o pulsar
  «Saltar tutorial» se guarda `tria-prima/tutorial-done`; la pantalla de reglas permite
  repetirlo (también reinicia los tours).
- Tour de presentación (`tutorial/tourSteps.ts`, `useTour`, `TourOverlay`, `TourTargets`):
  antes de los consejos, la primera partida recorre cada zona iluminándola (resto de la
  pantalla oscurecido, `Modal` transparente que cubre también la cabecera) con un globo
  «Siguiente / Saltar». Hay dos tours con flag propio: `game` (palabra del rival, dado
  central, tablero, objetivos, tu palabra —no en el desafío—, barra de acciones y botón
  «?») y `tracker` (palabra, contadores, adivinar y «?»), guardados en
  `tria-prima/tour-{kind}-done`. Las zonas se marcan con `<TourTarget id>` y se registran
  en `TourTargetsProvider` (layout raíz); la capa las mide con `measureInWindow` y, sin
  medida (tests), centra el globo. Los consejos esperan a que acabe el tour; en contra el
  maestro el tour espera al turno del humano y en el duelo a que no haya «pasa el
  dispositivo». `FlashMessage` flota fijo en la parte superior (fuera del `ScrollView`,
  `position:absolute`) para verse aunque haya scroll.
- No hay transición visual al empezar / reiniciar / terminar partida: el cambio entre
  setup / partida / fin es directo, igual que volver al menú (navegación normal del
  `Stack`, `router.dismissTo('/')`). Se probó un velo negro con fundido y se descartó
  por no convencer; lo único que se conserva es la coordinación de la música.
- `hooks/` — `useMatch` (duelo), `useVersus` (contra el maestro: igual que `useMatch`
  más la reproducción automática y retardada del turno de la app), `useTurnController`
  (control del turno del humano común a versus/duelo/desafío: estado de `turnFlow`,
  sonido, animación y declaración automática; las pantallas solo pintan `CubeGrid` y
  `TurnActions`), `useExitGuard` (con partida en curso, cualquier salida —flecha, botón
  atrás de Android, gesto de iOS, recarga web— pide confirmación vía `usePreventRemove`),
  `useSoloPlay`
  (solitario digital), `useTracker` (tracker físico), `useGameMusic`
  (coordina la música con el estado de la partida: pista de partida mientras hay una
  en curso —`active`—, pista de menú al terminar o al salir de la pantalla). Las cuatro
  pantallas con partida (`versus`/`play`/`solo`/`tracker`) lo invocan con `hasActiveGame`.
- `audio/` — sonido sintético, sin assets. La fuente de verdad son los specs compartidos:
  `sfxSpecs.ts` (efectos) y `score.ts` (partituras). Hay dos pistas de música (`MusicTrack`):
  `menu` y `game` (misma cadencia andaluza en Re menor; la de partida con pulso más vivo y
  melodía propia). `MusicPlayer.setTrack` cambia de pista respetando la preferencia y
  `useGameMusic` coordina la música con el estado de la partida: al empezar (o reiniciar)
  cambia a la pista de partida (`setTrack('game')` + `start` si la preferencia está activa)
  y, al terminar la partida o salir de la pantalla, vuelve a `menu`.
  En **web**, `sound.ts` y
  `music.ts` los tocan en vivo con la Web Audio API. En **iOS/Android**, `nativeAudio.ts`
  los pre-renderiza a WAV (PCM 16 bits mono, data URI) con `synth.ts` y los reproduce con
  `expo-audio`; la melodía nativa usa triángulo y un eco horneado en lugar del filtro+delay
  de la web. En nativo no hay política de autoplay: la música arranca con la app si la
  preferencia está activa. Los toggles ♪ / 🔊 viven en `AudioControls` (headerRight del
  Stack). Preferencias (audio y tutorial) persistentes con
  `@react-native-async-storage/async-storage` vía `audio/preferences.ts`: `_layout` las
  carga al arrancar (`loadPreferences`) antes de pintar nada y después se leen de forma
  síncrona desde memoria. Los toggles deciden por la preferencia, no por si suena.
  En jest, `expo-audio` está mockeado vía `moduleNameMapper` del proyecto ui
  (`src/ui/audio/__mocks__/expo-audio.ts`).
- `ornaments/` — biblioteca decorativa SVG (estilo grimorio: interior de los libros de
  D&D 5.5 + motivos alquímicos, todo obra propia): `ParchmentBackground` (fondo de
  pergamino con gradiente radial, moteado, viñeta y marca de agua: el emblema
  `OuroborosGlyph` enorme en la mitad derecha, sepia al 7 %), `OrnateFrame` (marco de doble
  línea oro+tinta con volutas en las esquinas; mide con `onLayout`; la prop
  `cornerScale` reduce las volutas para paneles compactos — es el marco estándar de
  todo panel: modales, zonas de bloqueo, panel de acciones, contadores del tracker,
  estadísticas del solitario y secciones de las reglas), `FiligreeDivider`
  (filete con remates; variantes `line`/`fleuron`), `AlchemicalSigil` (azufre, mercurio
  y sal a trazo), `ColorSeal` (sello circular por color de fase), `Ouroboros` (emblema
  hero) y `DropCap` (capitular de instrucciones). Son funciones puras de props, sin
  estado ni testID y con `pointerEvents="none"`. react-native-svg no soporta filtros
  SVG en nativo: la textura se logra con gradientes y un moteado determinista
  (PRNG mulberry32 con semilla fija en `scatter.ts`, nunca `Math.random`). Los glifos
  unicode 🜍 ☿ 🜔 se conservan solo en `FaceTile` (45 caras: texto es más barato que
  45 SVGs); en cubos no se mete SVG dentro del nodo animado de `CubeView`.
- `styles/tokens.ts` — paleta inspirada en la imagen *pergamino + tinta azul marino*,
  tipografía serif (Georgia / serif). El rediseño añade oro envejecido (`gold`,
  `goldBright`), `sepia`, `parchmentLight`, `gradients` y `shadows` (boxShadow en
  web / shadow+elevation en nativo). Incluye además los tokens `physical*`
  (`physicalColorHex/Contrast/Label`, `physicalSymbolGlyph/Label`) de la variante
  visual `physical` (ver modo tracker).
- `ConfirmProvider` — modal de confirmación accesible desde cualquier pantalla por hook
  `useConfirm()`.

### `app/` — Rutas (expo-router)
- `_layout.tsx` — Stack con `ConfirmProvider`.
- Títulos de la cabecera iguales a los botones de la home («Desafío», «Con el juego
  físico»). La cabecera de toda pantalla salvo la home y las reglas lleva «?» (reglas) y
  los toggles de audio.
- `index.tsx` — Home: cinco botones (Contra el maestro —principal, destacado—, Duelo, Desafío, Con el juego físico, Reglas).
- `instructions.tsx` — manual con vocabulario propio.
- `play.tsx` — modo Duelo. Muestra `SetupScreen` si no hay partida.
- `versus.tsx` — modo contra el maestro. Setup propio (solo la palabra del jugador).
- `solo.tsx` — modo solitario digital.
- `tracker.tsx` — modo tracker físico.

## Convención de `testID`

`testID` es el equivalente de `id` en React Native. En web se traduce a `data-testid`.
Formato `dominio/identificador[/sub]` en minúsculas.

| Zona | Patrón | Ejemplos |
|---|---|---|
| Home | `home/{destino}` | `home/play`, `home/versus`, `home/tracker`, `home/instructions` |
| Setup (Versus) | `setup/{word\|start\|level-apprentice\|level-master\|first-p1\|first-p2\|first-random}` | — |
| Turno (Versus) | `versus/{turn-name\|master-veil}` | — |
| Setup (Duelo) | `setup/{campo}` | `setup/p1`, `setup/p2`, `setup/first-random`, `setup/start` |
| Cuadrícula | `cube/{i}` | `cube/0`..`cube/8` |
| Acciones turno | `action/{kind}` | `action/roll-forward`, `action/spin-cw`, `action/swap`, `action/cancel` |
| Fin de turno | `turn/{declare\|end}` | `turn/declare`, `turn/end` |
| Cartas de palabra | `word-card/{i}` | `word-card/0`..`word-card/5` |
| Objetivo (tracker) | `objective/{objId}/{+\|-}` | `objective/sym:sulfur/+`, `objective/col:rubedo/-` |
| Adivinanza | `guess/{input\|submit}` | — |
| Cambio de turno | `handoff/continue` | — |
| Pantalla final | `end/{restart\|home}` | — |
| Modal confirmación | `confirm/{backdrop\|cancel\|ok}` | — |
| Footer | `footer`, `footer/store` | — |
| Audio (cabecera) | `audio/{music\|sfx}` | — |
| Contadores por insignia | `sign-counter/{kind}:{value}` | `sign-counter/symbol:sulfur`, `sign-counter/color:rubedo` |
| Objetivos (carril) | `objective-card/{objId}` | `objective-card/sym:sulfur` |
| Barra de acciones | `turn-actions`, `guess/open` | — |

## Flujo del turno (modo Duelo)

1. **`select-cube`** — el jugador toca uno de los 9 dados.
2. **`choose-action`** — aparece un panel con: Voltear ↷, Rotar ↻, Intercambiar,
   Cancelar. Como los dados tienen caras opuestas idénticas (`CubeSet`), voltear
   adelante/atrás y rotar ↻/↺ son equivalentes: basta un botón por movimiento
   (y `AppOpponent` solo explora `roll-forward` y `spin-cw`).
3. **`select-second-cube`** — si elige intercambiar, espera el segundo dado en la misma
   fila o columna.
4. **`declare`** — los 2 dados están tocados. La declaración se ejecuta automáticamente
   (libera bloqueos rotos, mantiene los vivos, añade nuevos, marca cartas del rival). La
   cuadrícula deja de responder; solo queda *Acabar turno*.

Tras *Acabar turno*: alterna currentPlayerId, los 2 dados pasan a `lockedThisTurn` del
siguiente turno y se muestra un *handoff* ("Pasa el dispositivo a {nombre}") antes de que
el rival pueda jugar.

La transición entre fases vive como funciones puras en `src/ui/turnFlow.ts` (`TurnState`,
`pressCube`, `rotateSelected`, `startSwap`, `commitSwap`, `cancelAction`, `cancelSwap`,
`canFinishTurn`, `turnMessage`), compartidas por las tres pantallas con flujo de turno
(`versus`, `play`, `solo`). Las pantallas solo ejecutan los efectos (audio, animación,
dominio); la decisión es pura y está cubierta por `src/ui/__tests__/turnFlow.test.ts`
(en el proyecto **logic**). Regla clave: un dado ya movido este turno no puede volver a
tocarse (el turno son 2 dados **distintos**). La regla la hace cumplir también el
dominio: `Board.touchedThisTurn` registra los dados movidos; `rotateCubeAt` rechaza
repetir dado o un tercero, `swapPositions` solo vale como única acción, solo se declara
con el turno completo (`isTurnComplete`) y `closeTurn` convierte los movidos en
`lockedThisTurn` del rival. `endMatchTurn`/`endSoloTurn` ya no reciben los dados.

## Reglas del juego (resumen funcional)

> El texto formal y narrativo está en `RulesBook` (`src/ui/components/RulesBook.tsx`). Aquí solo el resumen
> funcional para referencia rápida.

- 9 cubos con 6 caras = (símbolo `sulfur/mercury/salt`, color `nigredo/citrinitas/rubedo`).
- 6 objetivos fijos: 3 por símbolo + 3 por color.
- Cada jugador escribe en secreto una palabra de 6 letras. La app le asigna a cada
  letra una insignia (faceSign) única.
- Por turno: o intercambias 2 cubos de una misma fila/columna, o giras 2 cubos
  diferentes. Siempre 2 cubos.
- Tras el turno, esos 2 cubos quedan bloqueados para el rival el turno siguiente.
- Declarar objetivos cumplidos: alineaciones de 3 cubos con mismo símbolo o color en
  fila o columna. Cada objetivo declarado pasa a tu zona de bloqueo.
- Por cada objetivo declarado, se marca la carta del rival cuya insignia coincide.
  2 marcadores en una carta → letra revelada.
- En su fase de declaración, el jugador devuelve primero sus propios bloqueos al grupo
  disponible y después declara todo lo cumplido: si una alineación suya ha sobrevivido
  (ni el rival ni él la han deshecho), la vuelve a declarar y vuelve a puntuar. Los
  bloqueos del rival no se tocan y no se pueden declarar.
- La declaración se aplica automáticamente al cerrar la fase de movimiento (no hay
  botón "declarar").
- Adivinar: con 4 o más letras del rival reveladas y **solo al final de un turno en el
  que acaba de revelar una letra nueva** (`revealedThisTurn`). Un único intento:
  acierto → gana; fallo → gana el rival (`MatchState.failedGuessBy` dice quién falló,
  para el mensaje final). `guessMatchWord` recibe quién adivina y lo valida. En el
  tracker no hay turnos digitales: se puede adivinar en cuanto hay 4 letras.
- Primer turno del aprendiz inicial: solo manipulación, no se declara.

### Modo solitario digital
- Un solo jugador. La app esconde una palabra y gestiona todo en pantalla.
- Mismo flujo de turno que el duelo (4 fases, dos dados, declaración automática).
- Marcadores van sobre la palabra escondida del propio jugador.
- Al adivinar, puntuación = turnos jugados (incluido el turno en curso) + objetivos en
  disposición inicial. Rango
  según `domain/Score.ts` (Genio · Alumno supera al maestro · Sigue practicando · Vuelve a intentarlo).

### Modo tracker (con el juego físico)
- La app esconde una palabra clave. El jugador juega físicamente con el juego de mesa
  y pulsa ＋ en el objetivo correspondiente cada vez que lo cumple en la mesa.
- No hay puntuación digital ni contador de turnos: solo gestión de letras reveladas.
- ＋ sobre una carta ya revelada no cuenta; − deshace la última marca, y si esa marca
  reveló la letra, la vuelve a ocultar.
- Las insignias usan la variante visual `physical` (componente `SignGlyph` +
  tokens `physical*`): colores planos turquesa/blanco/naranja y letras griegas
  Δ Θ Ξ para que coincidan con los componentes del juego de mesa real. Solo
  letras y colores planos — sin arte copiado del juego original. El resto de
  modos sigue con la variante `alchemy` (sigilos y sellos del grimorio).

## Testing

### Stack
- **Jest** en configuración multi-proyecto (`package.json`):
  - Proyecto **logic** — `ts-jest` + entorno node. Tests de `domain`, `application`
    e `infrastructure` en `__tests__/` junto al código.
  - Proyecto **ui** — preset `jest-expo` + `@testing-library/react-native` (v14).
    Tests en `src/ui/__tests__/*.test.tsx`.
- Tipos vienen de `@types/jest` (v29, alineado con jest 29 que exige `jest-expo`).
- Cobertura: `collectCoverageFrom` cubre todo `domain` y `application`.

### Tipos de test
- **Unitarios** — toda regla del dominio o caso de uso lleva su test.
- **Funcionales** — `src/application/__tests__/functional/`: partidas guiadas por modo
  que encadenan los casos de uso reales con tablero determinista (`StubRandom([0])`
  deja el `CUBE_SET` en orden y sin girar: fila superior de azufres y fila inferior rubedo).
- **Smoke de UI** — `src/ui/__tests__/Screens.smoke.test.tsx`: un único render que
  recorre todas las pantallas con navegación imperativa.

### Particularidades de los tests de UI
- El `render` de RNTL 14 es **asíncrono**: `await renderRouter(...)` siempre.
- El store de navegación de expo-router es global al fichero de test y `renderRouter`
  no lo reinicia: usar un solo render por fichero y navegar con `router.navigate`
  dentro de `act`. Tras cada salto, la primera aserción debe ser `findBy*`.
- `renderRouter` activa fake timers: restaurar con `jest.useRealTimers()` en `afterEach`.

### Política TDD
- El test se escribe **antes** que el código y se ve fallar; después se implementa lo
  mínimo para ponerlo en verde y se refactoriza con la suite en verde.
- No se mockean las funciones del dominio; los tests de aplicación usan stubs solo de
  `Random` y `WordRepository` (en `src/application/__tests__/testdoubles.ts`).
- Convenciones: `Method.test.ts`, descripciones en inglés, estilo BDD.
- Datos de test ficticios: palabras y nombres inventados, nunca de personas reales ni
  material del juego original.

### Verificación en dispositivo
Todo cambio visible se comprueba además en un emulador o móvil Android real, con
captura (`adb exec-out screencap -p`) o lectura de la pantalla (`uiautomator dump`).
Conviene probar también con la navegación de **tres botones** (safe areas inferiores).
Lo que no se haya podido ver en dispositivo se dice explícitamente al entregar.

### Comandos
```bash
npm test            # toda la suite
npm run test:watch  # modo watch
npm run typecheck   # tsc --noEmit
```

## Publicación en Google Play

- Paquete `com.astonrendar.triaprima` (proyecto personal).
- Compilación oficial **en local** (no EAS): `cd android && ./gradlew bundleRelease`
  → `android/app/build/outputs/bundle/release/app-release.aab`.
- `/android` se genera con `npx expo prebuild --platform android` (está en `.gitignore`).
  Los ajustes de release viven en el config plugin `plugins/withAndroidRelease.js`:
  minificación R8 + `shrinkResources` y firma con la clave de subida, leída de
  `~/.gradle/gradle.properties` (`TRIAPRIMA_UPLOAD_*`); sin ella firma con la de debug.
- Permisos: `expo-audio` sin micrófono ni reproducción en segundo plano, y
  `android.blockedPermissions` quita el resto de permisos que no se usan.
- Compilar con **JDK 17** (`JAVA_HOME=/opt/homebrew/opt/openjdk@17/...`); con el JDK 25 de
  Android Studio falla el plugin foojay de Gradle 9.
- `docs/privacy.html` es la política de privacidad (GitHub Pages, carpeta `/docs` de
  `develop`); `store/google-play.md` tiene los textos de la ficha, los formularios y los
  pasos de firma.

### Checklist de cada subida a Play
1. Subir `expo.version` (semver) y `android.versionCode` (+1) en `app.json`.
2. `npm test` y `npm run typecheck` en verde.
3. Generar el AAB firmado y probar el build de release en un dispositivo.
4. Si sale de `release/x.y.z` o `hotfix/*`: fusionar en `main`, etiquetar `vx.y.z` y
   fusionar de vuelta en `develop`. Las subidas a pistas de prueba pueden salir de
   `develop`; producción, solo de `main`.

### Secretos y firma
- Nunca se versionan el keystore (`*.jks`, `*.keystore`), sus contraseñas, el
  `gradle.properties` con `TRIAPRIMA_UPLOAD_*` ni credenciales de Play Console.
  La clave de subida vive en `~/keys/` y su contraseña en `~/.gradle/gradle.properties`.
- Si se pierde la clave de subida se solicita su restablecimiento en Play Console; no se
  genera otra sin avisar al mantenedor.

### Privacidad y permisos
- La app no recoge, envía ni registra datos personales: sin analítica, anuncios ni SDK
  de terceros con red. AsyncStorage guarda solo preferencias y flags de tutorial.
- Cualquier cambio en permisos o en lo que se guarda obliga a actualizar
  `docs/privacy.html` y el formulario de seguridad de datos de `store/google-play.md`.
- Sin `console.log` en código de producción.

## Flujo de trabajo git

Repositorio: <https://github.com/AstonRendar/tria-prima>. Se sigue **git flow**:

> **Autoría**: ningún agente (Claude, Antigravity, etc.) firma commits, PRs, documentos
> ni ningún otro artefacto como autor o coautor. Nada de `Co-Authored-By` ni pies tipo
> "Generated with…". La autoría es siempre del usuario.

- `main` — solo versiones estables (releases). No se hace commit directo.
- `develop` — rama de integración; el trabajo diario se fusiona aquí.
- `feature/<nombre>` — una rama por funcionalidad, sale de `develop` y vuelve a `develop`.
- `release/<versión>` — preparación de release, de `develop` a `main` (+ merge de vuelta a `develop`).
- `hotfix/<nombre>` — arreglos urgentes sobre `main` (+ merge de vuelta a `develop`).
- Las ramas se fusionan en local con `merge --no-ff` y se borran tras fusionarse.
- Sin `push --force`, sin reescribir historia publicada y sin `reset --hard` sobre
  trabajo sin commitear salvo confirmación del mantenedor.

### Commits
- Pequeños y autocontenidos: la suite pasa en cada uno.
- Mensaje breve en castellano que explique el propósito, no la mecánica; prefijo tipo
  Conventional Commits cuando ayude (`fix(home): …`).

## Flujo de trabajo por tarea
1. Leer el código afectado; preguntar si algo es ambiguo.
2. Si el enfoque no es evidente, proponerlo y esperar confirmación.
3. Escribir los tests y verlos fallar (ver Política TDD).
4. Implementar lo mínimo y refactorizar con la suite en verde.
5. Pasar `npm test` y `npm run typecheck` completos.
6. Verificar en dispositivo si el cambio es visible.
7. Actualizar en el mismo commit lo que el cambio deje desfasado: `AGENTS.md` (tabla de
   `testID`, rutas, resumen de reglas), `app/instructions.tsx` / `RulesBook` y
   `store/google-play.md`.
8. Commit.

## Principios de desarrollo
- **Castellano** en mensajes de UI y textos al usuario. **Inglés** en código.
- **SOLID + DDD + TDD + YAGNI + KISS**.
- Sin comentarios obvios. El *porqué*, no el *qué*.
- Sin documentación extra fuera de `AGENTS.md` / `CLAUDE.md` salvo que se pida
  (excepción: `docs/privacy.html` y `store/`, necesarios para Google Play).
- **Accesibilidad**: todo elemento interactivo nuevo lleva `accessibilityRole`,
  `accessibilityLabel` (con su estado si es un interruptor) y `testID` según la
  convención; los colores nuevos mantienen contraste legible sobre el pergamino.

### Dependencias
- No se añaden dependencias ni se cambia el stack sin aprobación del mantenedor; se
  proponen con su justificación.
- Se instalan con `npx expo install` para respetar la compatibilidad con el SDK.
- Tras añadir un módulo nativo, revisar los permisos resultantes y
  `android.blockedPermissions`.
- Sin manejo de errores defensivo ni features no pedidas.

## Lo que NO hacer
- No mezclar lógica de juego en componentes UI (vive en `domain/` y `application/`).
- No invocar `Math.random` desde dominio/aplicación; usar la interfaz `Random`.
- No versionar `/android` ni editarlo a mano: los cambios nativos van en config plugins
  (`plugins/`).
- No incluir gráficos, logos, textos literales ni nombres del juego original más allá
  de la atribución mínima del footer.
- No introducir backend ni almacenamiento remoto.

## Mantenimiento de AGENTS.md y CLAUDE.md

Cuando aparezca información relevante (decisión de arquitectura, regla, dependencia,
convención), actualiza `AGENTS.md` proactivamente.

- `AGENTS.md` — contrato común entre agentes.
- `CLAUDE.md` — solo lo específico de Claude Code; apunta a `AGENTS.md` para el resto.
- No duplicar contenido.
- Este fichero recoge **decisiones tomadas**: las nuevas se anotan con su fecha
  (`decisión del AAAA-MM-DD`). No se revierten sin aprobación del mantenedor; si una
  tarea lo exige, se para y se pregunta.
