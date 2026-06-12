# Tria Prima — Instrucciones para Claude

## Contexto del proyecto

**OBLIGATORIO**: Al inicio de cada conversación, antes de responder a la primera petición del usuario,
debes leer el fichero [AGENTS.md](./AGENTS.md) con la herramienta Read. Ese fichero contiene el contexto
imprescindible del proyecto (identidad, reglas de propiedad intelectual, stack, arquitectura por capas,
reglas del juego, modos, convenciones de testing y principios de desarrollo) y es la única fuente de
verdad para esa información. No asumas nada sobre el proyecto sin haberlo leído.

`AGENTS.md` es el estándar compartido entre todos los agentes (Claude Code, Antigravity, etc.); no
dupliques su contenido aquí. Todo lo que no sea específico de Claude Code debe escribirse en `AGENTS.md`.

## Comandos útiles

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo (Metro + web)
npx expo start

# Lanzar en iOS / Android (requiere simulador/dispositivo)
npx expo start --ios
npx expo start --android

# Build nativa en la nube (requiere cuenta EAS)
eas build --platform ios
eas build --platform android

# Tests y tipos
npm test
npm run test:watch
npm run typecheck
```

## Reglas específicas de este entorno
- Idioma de comunicación con el usuario: **castellano**.
- **No firmar nada como autor**: sin `Co-Authored-By` en commits ni "Generated with"
  en PRs o documentos. Ver la regla común en `AGENTS.md` (aplica a todos los agentes).
- No instalar dependencias nuevas sin confirmación previa salvo que sean evidentes.
- No proponer cambios de stack sin confirmar con el usuario.
- Mantener `AGENTS.md` actualizado de forma proactiva ante cualquier decisión nueva del proyecto.
- **Propiedad intelectual**: no usar el nombre "Kryptex" como identidad del producto, no incluir
  gráficos del juego original, no copiar textos literales del manual. Ver sección dedicada en
  `AGENTS.md`.
