import { Random } from './Random';

export interface WordRepository {
  randomWord(): string;
}

const WORDS_6: ReadonlyArray<string> = [
  'CAMINO', 'PUERTA', 'JUGADA', 'PIEDRA', 'CIUDAD', 'MUSICA',
  'CAMARA', 'ESPEJO', 'JARDIN', 'PUEBLO', 'SOMBRA', 'COLINA',
  'PUENTE', 'GRANJA', 'BOSQUE', 'GANADO', 'ESPADA', 'TIERRA',
  'TEATRO', 'VIENTO', 'VERANO', 'CABEZA', 'COLLAR', 'ESCOBA',
  'FUTBOL', 'AGENTE', 'ABRIGO', 'ABRAZO', 'CAMION', 'CARNET',
  'CARTEL', 'CASTOR', 'CENIZA', 'CENTRO', 'CIELOS', 'CIERRE',
  'CODIGO', 'COLEGA', 'CONEJO', 'CONDOR', 'CORAJE', 'CORDON',
  'CORONA', 'COSMOS', 'CRATER', 'CRIMEN', 'CUADRA', 'CUADRO',
  'CUARTO', 'CUELLO', 'CUENTO', 'CUERDA', 'CUERNO', 'CUERPO',
  'CUMBRE', 'DIARIO', 'DOCTOR', 'ESCENA', 'FRESAS', 'GLOBOS',
  'HELADO', 'HIERRO', 'HUMANO', 'JARRON', 'JINETE', 'JUEGOS',
  'LAGUNA', 'LIBROS', 'LIENZO', 'LIMITE', 'LLAVES', 'LLUVIA',
  'LOCURA', 'MALETA', 'MANADA', 'MARCHA', 'MARINO', 'MARMOL',
  'MEDIDA', 'MEZCLA', 'MOLINO', 'MONEDA', 'MUELLE', 'NOCHES',
  'NOMBRE', 'NUMERO', 'NUTRIA', 'OBJETO', 'OFICIO', 'OLIVAS',
  'ORGANO', 'ORILLA', 'PADRES', 'PALOMA', 'PARADA', 'PARQUE',
  'PASAJE', 'PELOTA', 'PIERNA', 'PILOTO', 'PINCEL', 'PISTAS',
  'PLANTA', 'PLATOS', 'PLAYAS', 'POSTRE', 'PREMIO', 'QUESOS',
  'QUINCE', 'RECETA', 'REGALO', 'REINOS', 'RIBERA', 'RINCON',
  'ROBLES', 'RUEDAS', 'RUINAS', 'SABANA', 'SANGRE', 'SIESTA',
  'SIRENA', 'SONIDO', 'SORTEO', 'SUERTE', 'TALLER', 'TAMBOR',
  'TARDES', 'TAREAS', 'TARIFA', 'TECHOS', 'TEMPLO', 'TERROR',
  'TESORO', 'TIGRES', 'TIMBAL', 'TOCADO', 'TOMATE', 'TORERO',
  'TORNEO', 'TRENES', 'TROFEO', 'TURNOS', 'UNIDAD', 'VECINO',
  'VECTOR', 'VEINTE', 'VENENO', 'VERDAD', 'VEREDA',
  'VIEJOS', 'VOLCAN', 'VUELOS', 'ZAPATO', 'ZAGUAN',
].filter((w) => w.length === 6);

export class InMemoryWordRepository implements WordRepository {
  constructor(private readonly random: Random) {}
  randomWord(): string {
    return this.random.pick(WORDS_6);
  }
}
