import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Footer } from '@/ui/components/Footer';
import { DropCap, FiligreeDivider, OrnateFrame, Ouroboros, ParchmentBackground } from '@/ui/ornaments';
import { colors, fonts, shadows, spacing } from '@/ui/styles/tokens';

const startsWithLetter = (body: string) => /^[A-Za-zÁÉÍÓÚÑáéíóúñ]/.test(body);

type Section = { title: string; body: string };

const SECTIONS: Section[] = [
  {
    title: 'La idea',
    body:
      'Paracelso, viejo alquimista y maestro del laboratorio, deja a dos de sus aprendices a solas con el experimento más delicado: cifrar una palabra con la materia. Cada uno esconde una palabra de seis letras detrás de seis cartas selladas. Sobre la mesa, nueve cubos combinan los tres principios (azufre, mercurio, sal) con los tres colores de la Gran Obra (nigredo, citrinitas, rubedo). Manipulándolos por turnos, cada aprendiz busca alinear los principios y descifrar la palabra del rival antes de que el rival descifre la suya.',
  },
  {
    title: 'Lo que hay en juego',
    body:
      '· Nueve cubos. Cada cara muestra un símbolo alquímico (azufre 🜍, mercurio ☿ o sal 🜔) sobre uno de los tres colores de la Gran Obra (nigredo negro, citrinitas oro o rubedo rojo).\n· Seis cartas de objetivo: tres por cada símbolo y tres por cada color.\n· Doce cartas de jugador (seis por aprendiz). Cada carta lleva una letra oculta por detrás y, por delante, una insignia única: o bien uno de los tres símbolos, o bien uno de los tres colores.\n· Doce marcadores (seis por jugador).\n· Dos anillos de bloqueo y un indicador.',
  },
  {
    title: 'Antes de empezar',
    body:
      '1. Tirad los nueve cubos sobre el centro de la mesa y disponedlos formando una cuadrícula de 3×3.\n\n2. Colocad las seis cartas de objetivo donde ambos aprendices puedan verlas.\n\n3. Pensad cada uno una palabra clave: un sustantivo común singular, de seis letras exactas, sin nombres propios.\n\n4. Sin que el rival lo vea, escribid vuestra palabra en el dorso de vuestras seis cartas de jugador, una letra por carta.\n\n5. Colocad esas seis cartas boca abajo frente al rival, ordenadas en su sentido de lectura. La insignia de cada carta queda a la vista de ambos; la letra queda oculta.\n\n6. Coged vuestros seis marcadores y dejadlos a mano.\n\n7. Por mandato del maestro, empieza el aprendiz que haya leído algo nuevo más recientemente. Su primer turno será un poco distinto, como veréis.',
  },
  {
    title: 'Cómo se juega un turno',
    body:
      'Cada turno tiene dos fases en este orden:\n\n1. Manipulación de los cubos.\n2. Declaración de objetivos cumplidos.\n\nEn el primer turno del aprendiz inicial se omite la segunda fase: solo puede manipular los cubos, para evitar que se aproveche de las alineaciones que hayan salido al azar.',
  },
  {
    title: 'Fase 1 — manipular los cubos',
    body:
      'Debes elegir UNA de estas dos acciones y solo una:\n\n· Intercambiar la posición de dos cubos que estén en la misma fila o columna (no hace falta que sean adyacentes). No se giran al moverlos.\n\n· Girar dos cubos diferentes. Cada uno puede voltearse hacia adelante o hacia atrás para cambiar la cara superior, o girarse sobre sí mismo sin cambiar la cara superior. No se permite voltearlos lateralmente.\n\nSiempre dos cubos. Al terminar la fase, coloca los anillos sobre esos dos cubos para indicar al rival que durante su próximo turno no podrá tocarlos.',
  },
  {
    title: 'Fase 2 — declarar objetivos',
    body:
      'Un objetivo se cumple cuando, en una fila o columna del tablero, las caras superiores de los tres cubos comparten el mismo símbolo o el mismo color. Repasa el tablero y declara TODOS los objetivos cumplidos que veas; puedes anunciar varios a la vez, siempre que sean distintos.\n\nLa carta de cada objetivo que declares pasa a tu lado de la mesa como "bloqueada". Ni tú ni el rival podéis declarar un objetivo que esté en una zona de bloqueo. Cuando vuelvas a declarar en un turno posterior, retira las cartas que tenías en tu zona y coloca las nuevas en su lugar.',
  },
  {
    title: 'Marcar y revelar letras',
    body:
      'Cada vez que declaras un objetivo, el rival debe colocar uno de tus marcadores sobre la carta suya cuya insignia coincida con la del objetivo. Cuando una carta acumule dos marcadores, retiradlos y dadle la vuelta: la letra oculta queda al descubierto.',
  },
  {
    title: 'Cómo se gana',
    body:
      'Cuando hayas conseguido revelar cuatro o más letras de la palabra del rival, al final de un turno donde acabes de descubrir una letra nueva puedes intentar adivinarla. Solo se puede intentar una vez:\n\n· Si aciertas, ganas el duelo.\n· Si fallas, el rival gana.\n\nSi no te ves con confianza, no es obligatorio adivinar; pasa el turno y sigue jugando.',
  },
  {
    title: 'Modo «Desafío» (digital)',
    body:
      'Sin rival, frente al athanor de Paracelso. La app esconde la palabra, gestiona los cubos en pantalla y aplica los marcadores conforme cumples objetivos. Tu meta: descifrar la palabra antes de quedarte sin paciencia. Al final se cuenta una puntuación (turnos jugados + objetivos cumplidos en la disposición inicial). Cuanto menor, mejor — el maestro te juzgará en consecuencia.',
  },
  {
    title: 'Modo «Con el juego físico»',
    body:
      'Una versión más austera para acompañar al juego de mesa real. El maestro sella una palabra y muestra sus seis cartas con sus insignias en la app; tú juegas físicamente con los cubos sobre la mesa. Cada vez que cumplas un objetivo, pulsa ＋ en la app y el maestro irá colocando los marcadores y revelando las letras cuando toque. El botón − sirve para deshacer un marcado erróneo.',
  },
  {
    title: 'Atribución',
    body:
      'Tria Prima es una aplicación independiente inspirada en el juego de mesa Kryptex (Zacatrus, autor: José Joaquín Bernal). Las mecánicas son las del juego original; el lore en torno a Paracelso, los textos, los iconos y la presentación son obra propia de este proyecto. Si disfrutas jugando, considera adquirir la versión física para apoyar al autor y la editorial.',
  },
];

export default function Instructions() {
  return (
    <View style={styles.page}>
      <ParchmentBackground />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <Ouroboros size={84} color={colors.text} accent={colors.gold} />
          <Text style={styles.heroTitle}>Tria Prima</Text>
          <Text style={styles.heroSubtitle}>Reglas del cifrado</Text>
          <View style={styles.heroRule}>
            <FiligreeDivider width={180} variant="fleuron" />
          </View>
        </View>

        {SECTIONS.map((s) => (
          <OrnateFrame key={s.title} padding={spacing.lg} style={[styles.section, shadows.card]}>
            <Text style={styles.sectionTitle}>{s.title}</Text>
            <View style={styles.sectionRule}>
              <FiligreeDivider width={150} />
            </View>
            {startsWithLetter(s.body) ? (
              <View style={styles.bodyRow}>
                <DropCap letter={s.body[0]} />
                <Text style={[styles.sectionBody, styles.bodyAfterCap]}>
                  {s.body.slice(1)}
                </Text>
              </View>
            ) : (
              <Text style={styles.sectionBody}>{s.body}</Text>
            )}
          </OrnateFrame>
        ))}

        <View style={styles.flourish}>
          <FiligreeDivider width={180} variant="fleuron" />
        </View>
        <Footer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingBottom: 60,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 16,
  },
  heroTitle: {
    fontFamily: fonts.serif,
    color: colors.accent,
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: 3,
    marginTop: spacing.md,
  },
  heroSubtitle: {
    fontFamily: fonts.serif,
    color: colors.textMuted,
    fontSize: 15,
    fontStyle: 'italic',
    marginTop: 4,
  },
  heroRule: {
    marginTop: 14,
  },
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
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bodyAfterCap: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  flourish: {
    alignItems: 'center',
    marginTop: 8,
  },
});
