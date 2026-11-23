# Ficha de Google Play — Tria Prima

## Datos de la aplicación
- **Nombre**: Tria Prima
- **Paquete**: `com.astonrendar.triaprima`
- **Categoría**: Juegos › Juegos de mesa (alternativa: Puzles)
- **Gratuita**, sin anuncios ni compras integradas
- **Política de privacidad**: `https://astonrendar.github.io/tria-prima/privacy.html`
  (GitHub Pages activo: rama `develop`, carpeta `/docs`)

## Descripción breve (máx. 80 caracteres)
Descifra la palabra secreta alineando dados alquímicos. Duelo de lógica.

## Descripción completa (máx. 4000 caracteres)
Paracelso ha sellado una palabra de seis letras. Para descifrarla tendrás que dominar la materia: nueve dados que combinan tres principios alquímicos (azufre, mercurio y sal) con los tres colores de la Gran Obra.

En cada turno mueves dos dados: los volteas, los giras o intercambias su posición. Cuando una fila o columna alinea tres símbolos o tres colores iguales, cumples un objetivo y marcas una de las cartas que esconden la palabra. Con dos marcas, la letra queda al descubierto. Reúne cuatro letras y arriesga tu respuesta… pero solo tienes un intento.

MODOS DE JUEGO
• Contra el maestro: duelo contra la app, con dos niveles de dificultad.
• Duelo a dos: dos jugadores en el mismo dispositivo.
• Desafío: un jugador contra el reloj de turnos, con puntuación.
• Con el juego físico: acompaña tus partidas de mesa llevando la cuenta de los marcadores.

CARACTERÍSTICAS
• Tutorial integrado en tu primera partida.
• Reglas consultables en cualquier momento sin salir de la partida.
• Música y efectos sintetizados, con controles para silenciarlos.
• Sin conexión, sin anuncios, sin cuentas y sin recogida de datos.

Tria Prima es una aplicación independiente, sin relación con la editorial, inspirada en el juego de mesa Kryptex (Zacatrus, de José Joaquín Bernal). Si te gusta, apoya a sus creadores comprando la versión física.

> Nota: la mención a Kryptex es un reconocimiento. Si Google la marca por uso de una
> marca ajena en la ficha, sustituirla por "inspirada en un juego de mesa de deducción"
> (la atribución completa sigue dentro de la app).

## Formulario de seguridad de los datos
- ¿Recoge o comparte datos de usuario? **No**.
- Cifrado en tránsito: no aplica (no hay transmisión de datos).
- Eliminación de datos: no aplica.

## Clasificación de contenido (IARC)
Sin violencia, sin lenguaje malsonante, sin interacción entre usuarios, sin compras, sin ubicación. Resultado esperado: PEGI 3 / Para todos.

## Público objetivo
Recomendado: 13 años o más (evita aplicar la política de familias, que exige requisitos extra). Si se quiere incluir a menores, revisar la política de familias de Google Play antes.

## Recursos gráficos pendientes
- Icono 512×512: `store/graphics/icon-512.png`.
- Gráfico destacado 1024×500: `store/graphics/feature-1024x500.jpg` (fuente en `feature.html`, se renderiza con Chrome headless).
- Capturas de teléfono (1080×2160, Pixel 8 sin barras del sistema): `store/graphics/screenshots/`.

## Firma
La clave de subida ya existe: `~/keys/tria-prima-upload.jks` (alias `tria-prima`), con las contraseñas en `~/.gradle/gradle.properties`. Ambos fuera del repo; guardar copia de seguridad.

1. Generar la clave de subida (fuera del repo):
   `keytool -genkeypair -v -keystore ~/keys/tria-prima-upload.jks -alias tria-prima -keyalg RSA -keysize 2048 -validity 10000`
2. Añadir a `~/.gradle/gradle.properties`:
   ```
   TRIAPRIMA_UPLOAD_STORE_FILE=/Users/<usuario>/keys/tria-prima-upload.jks
   TRIAPRIMA_UPLOAD_STORE_PASSWORD=...
   TRIAPRIMA_UPLOAD_KEY_ALIAS=tria-prima
   TRIAPRIMA_UPLOAD_KEY_PASSWORD=...
   ```
3. `npx expo prebuild --platform android` y `cd android && ./gradlew bundleRelease`
   (con `JAVA_HOME` apuntando a un JDK 17).
4. Subir `android/app/build/outputs/bundle/release/app-release.aab` y activar Play App Signing.
5. Antes de cada subida, incrementar `android.versionCode` en `app.json`.
