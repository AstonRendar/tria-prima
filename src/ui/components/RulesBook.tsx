import { StyleSheet, Text, View } from 'react-native';
import { DropCap, FiligreeDivider, OrnateFrame } from '@/ui/ornaments';
import { CubeColor } from '@/domain/Color';
import { colors, cubeColorHex, fonts, shadows, spacing } from '@/ui/styles/tokens';

const startsWithLetter = (body: string) => /^[A-Za-zÁÉÍÓÚÑáéíóúñ]/.test(body);

type Section = { title: string; body: string };

export const RULE_SECTIONS: ReadonlyArray<Section> = [
  {
    title: 'La idea',
    body:
      'Paracelso, viejo alquimista y maestro del laboratorio, deja a dos de sus aprendices a solas con el experimento más delicado: cifrar una palabra con la materia. Cada uno esconde una palabra de seis letras detrás de seis cartas selladas. En el laboratorio, nueve dados combinan los tres principios (azufre, mercurio, sal) con los tres colores de la Gran Obra (nigredo, citrinitas, rubedo). Manipulándolos por turnos, cada aprendiz busca alinear los principios y descifrar la palabra del rival antes de que el rival descifre la suya.',
  },
  {
    title: 'Lo que ves en pantalla',
    body:
      '· El tablero: nueve dados en una cuadrícula de 3×3. Cada cara muestra un símbolo alquímico (azufre 🜍, mercurio ☿ o sal 🜔) sobre uno de los tres colores de la Gran Obra (nigredo, citrinitas o rubedo).\n· La columna de objetivos: seis cartas, una por cada símbolo y una por cada color.\n· La palabra de cada aprendiz: seis cartas con la letra oculta. Por delante, cada carta muestra una insignia única: uno de los tres símbolos o uno de los tres colores.\n· La zona de bloqueo de cada aprendiz, junto a su palabra, donde van los objetivos que cumple.',
  },
  {
    title: 'Antes de empezar',
    body:
      'Cada aprendiz piensa una palabra clave: un sustantivo común, en singular o en plural, de seis letras exactas, sin nombres propios, y la escribe sin que el rival la vea. La app reparte las letras entre sus seis cartas y coloca los dados al azar. Elegid quién empieza: su primer turno será un poco distinto, como veréis.',
  },
  {
    title: 'Cómo se juega un turno',
    body:
      'Cada turno tiene dos fases en este orden:\n\n1. Manipulación de los dados.\n2. Declaración de objetivos cumplidos.\n\nEn el primer turno del aprendiz inicial se omite la segunda fase: solo puede manipular los dados, para evitar que se aproveche de las alineaciones que hayan salido al azar.',
  },
  {
    title: 'Fase 1 — manipular los dados',
    body:
      'Debes elegir UNA de estas dos acciones y solo una:\n\n· Intercambiar la posición de dos dados que estén en la misma fila o columna (no hace falta que sean adyacentes). No se giran al moverlos.\n\n· Girar dos dados diferentes. Cada uno puede voltearse hacia adelante o hacia atrás para cambiar la cara superior, o rotarse sobre sí mismo sin cambiar la cara superior. No se permite voltearlos lateralmente.\n\nSiempre dos dados. Los dos que muevas quedan atenuados y marcados con ⊘: durante su próximo turno, el rival no podrá tocarlos.',
  },
  {
    title: 'Fase 2 — declarar objetivos',
    body:
      'Un objetivo se cumple cuando, en una fila o columna del tablero, las caras superiores de los tres dados comparten el mismo símbolo o el mismo color. Al mover tu segundo dado, la app declara por ti TODOS los objetivos cumplidos.\n\nLa carta de cada objetivo cumplido pasa a tu zona de bloqueo. Mientras esté allí, tu rival no puede cumplirlo.\n\nAl empezar tu siguiente turno, las cartas de tu zona vuelven a la columna de objetivos. Si una alineación tuya ha sobrevivido —el rival no la ha deshecho y tú tampoco—, vuelve a declararse y vuelve a puntuar. Por eso conviene romper las alineaciones del rival antes de que le vuelva el turno.',
  },
  {
    title: 'Marcar y revelar letras',
    body:
      'Cada objetivo que cumples pone un marcador en la carta del rival cuya insignia coincide con la del objetivo. Cuando una carta acumula dos marcadores, su letra oculta queda al descubierto.',
  },
  {
    title: 'Cómo se gana',
    body:
      'Cuando hayas conseguido revelar cuatro o más letras de la palabra del rival, puedes intentar adivinarla, pero solo al final de un turno en el que acabes de descubrir una letra nueva. Solo se puede intentar una vez:\n\n· Si aciertas, ganas el duelo.\n· Si fallas, el rival gana.\n\nSi no te ves con confianza, no es obligatorio adivinar; pasa el turno y sigue jugando.',
  },
  {
    title: 'Modo «Contra el maestro»',
    body:
      'Juegas tú contra la app. Escribes tu palabra, eliges el nivel del maestro (aprendiz o maestro) y quién empieza. El maestro esconde su palabra y juega sus turnos solo: verás cómo escoge y mueve cada dado. Mientras juega, un velo cubre el tablero; espera a que termine. Al mover tu segundo dado, la app declara por ti todos los objetivos cumplidos y coloca los marcadores. Si en ese turno has descubierto una letra y ya tienes cuatro, aparece la casilla para adivinar.',
  },
  {
    title: 'Modo «Duelo a dos»',
    body:
      'Dos personas comparten el dispositivo. Cada una escribe su palabra sin que la otra mire. Se juega con las mismas reglas. Al acabar cada turno aparece un aviso para pasar el dispositivo al rival.',
  },
  {
    title: 'Modo «Desafío» (digital)',
    body:
      'Sin rival, frente al athanor de Paracelso. La app esconde la palabra, gestiona los dados en pantalla y aplica los marcadores conforme cumples objetivos. Tu meta: descifrar la palabra antes de quedarte sin paciencia. Al final se cuenta una puntuación (turnos jugados + objetivos cumplidos en la disposición inicial). Cuanto menor, mejor: por debajo de 8, genio; de 8 a 10, el alumno supera al maestro; de 11 a 14, sigue practicando; más de 14, vuelve a intentarlo.',
  },
  {
    title: 'Modo «Con el juego físico»',
    body:
      'Una versión más austera para acompañar al juego de mesa real. El maestro sella una palabra y muestra sus seis cartas con sus insignias en la app; tú juegas físicamente con los cubos sobre la mesa. Cada vez que cumplas un objetivo, pulsa ＋ en la app y el maestro irá colocando los marcadores y revelando las letras cuando toque. El botón − sirve para deshacer un marcado erróneo.',
  },
  {
    title: 'Si tienes el juego de mesa',
    body:
      'Las reglas son las mismas; lo que en la app ocurre solo, en la mesa lo hacéis a mano.\n\n· Componentes: nueve cubos, seis cartas de objetivo, doce cartas de jugador (seis por aprendiz), doce marcadores y dos anillos de bloqueo.\n\n· Preparación: tirad los cubos y formad la cuadrícula de 3×3; dejad las cartas de objetivo a la vista. Cada uno escribe su palabra en el dorso de sus seis cartas, una letra por carta, y las coloca boca abajo frente al rival, en su sentido de lectura, con la insignia a la vista. Por mandato del maestro, empieza quien haya leído algo nuevo más recientemente.\n\n· Bloqueo de cubos: al acabar la fase 1, colocad los anillos sobre los dos cubos movidos.\n\n· Objetivos: declarad en voz alta todos los cumplidos y poned sus cartas en vuestra zona; al llegar vuestra fase de declaración, primero las devolvéis a la mesa.\n\n· Marcadores: por cada objetivo declarado, el rival coloca uno de vuestros marcadores sobre su carta con esa insignia. Con dos marcadores, retiradlos y dadle la vuelta a la carta.',
  },
  {
    title: 'Atribución',
    body:
      'Tria Prima es una aplicación independiente inspirada en el juego de mesa Kryptex (Zacatrus, autor: José Joaquín Bernal). Las mecánicas son las del juego original; el lore en torno a Paracelso, los textos, los iconos y la presentación son obra propia de este proyecto. Si disfrutas jugando, considera adquirir la versión física para apoyar al autor y la editorial.',
  },
];

// Los nombres de los colores de la Gran Obra no dicen nada por sí solos: en el
// texto se escriben en negrita y con su propio color.
const COLOR_WORDS = /(nigredo|citrinitas|rubedo)/i;

export type RuleSpan = { text: string; color?: CubeColor };

// Al partir por un grupo capturado, los nombres de color quedan en las
// posiciones impares.
export function splitColorWords(body: string): RuleSpan[] {
  return body
    .split(COLOR_WORDS)
    .map((text, i) => (i % 2 === 1 ? { text, color: text.toLowerCase() as CubeColor } : { text }))
    .filter((span) => span.text.length > 0);
}

function RuleText({ body }: { body: string }) {
  return (
    <>
      {splitColorWords(body).map((span, i) =>
        span.color ? (
          <Text key={i} style={[styles.colorWord, { color: cubeColorHex[span.color] }]} testID={`rules/color/${span.color}`}>
            {span.text}
          </Text>
        ) : (
          span.text
        )
      )}
    </>
  );
}

// Las reglas completas, sección a sección. Se usan en la pantalla de reglas y
// en el panel que se abre durante la partida.
export function RulesBook() {
  return (
    <>
      {RULE_SECTIONS.map((s) => (
        <OrnateFrame key={s.title} padding={spacing.lg} style={[styles.section, shadows.card]}>
          <Text style={styles.sectionTitle}>{s.title}</Text>
          <View style={styles.sectionRule}>
            <FiligreeDivider width={150} />
          </View>
          {startsWithLetter(s.body) ? (
            <View style={styles.bodyRow}>
              <DropCap letter={s.body[0]} />
              <Text style={[styles.sectionBody, styles.bodyAfterCap]}>
                <RuleText body={s.body.slice(1)} />
              </Text>
            </View>
          ) : (
            <Text style={styles.sectionBody}>
              <RuleText body={s.body} />
            </Text>
          )}
        </OrnateFrame>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: fonts.serif,
    color: colors.danger,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  sectionRule: {
    marginTop: 4,
    marginBottom: 10,
    opacity: 0.8,
  },
  sectionBody: {
    fontFamily: fonts.serif,
    color: colors.text,
    fontSize: 16,
    lineHeight: 26,
  },
  colorWord: {
    fontWeight: '800',
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bodyAfterCap: {
    flex: 1,
    marginLeft: spacing.sm,
  },
});
