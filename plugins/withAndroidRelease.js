// Ajustes de la build de release que `expo prebuild` regenera en /android:
// minificación con R8 y firma con la clave de subida de Google Play.
// La clave y sus contraseñas viven fuera del repo, en ~/.gradle/gradle.properties
// (TRIAPRIMA_UPLOAD_STORE_FILE, TRIAPRIMA_UPLOAD_STORE_PASSWORD,
// TRIAPRIMA_UPLOAD_KEY_ALIAS, TRIAPRIMA_UPLOAD_KEY_PASSWORD). Sin ellas la release
// se firma con la clave de debug, válida solo para instalar a mano.
const { withAppBuildGradle, withGradleProperties } = require('expo/config-plugins');

const GRADLE_PROPERTIES = {
  'android.enableMinifyInReleaseBuilds': 'true',
  'android.enableShrinkResourcesInReleaseBuilds': 'true',
};

const UPLOAD_SIGNING_CONFIG = `
        if (project.hasProperty('TRIAPRIMA_UPLOAD_STORE_FILE')) {
            upload {
                storeFile file(TRIAPRIMA_UPLOAD_STORE_FILE)
                storePassword TRIAPRIMA_UPLOAD_STORE_PASSWORD
                keyAlias TRIAPRIMA_UPLOAD_KEY_ALIAS
                keyPassword TRIAPRIMA_UPLOAD_KEY_PASSWORD
            }
        }`;

const RELEASE_SIGNING =
  "signingConfig project.hasProperty('TRIAPRIMA_UPLOAD_STORE_FILE') ? signingConfigs.upload : signingConfigs.debug";

function withMinify(config) {
  return withGradleProperties(config, (cfg) => {
    for (const [key, value] of Object.entries(GRADLE_PROPERTIES)) {
      const existing = cfg.modResults.find((item) => item.type === 'property' && item.key === key);
      if (existing) existing.value = value;
      else cfg.modResults.push({ type: 'property', key, value });
    }
    return cfg;
  });
}

function withUploadSigning(config) {
  return withAppBuildGradle(config, (cfg) => {
    let gradle = cfg.modResults.contents;
    if (gradle.includes('TRIAPRIMA_UPLOAD_STORE_FILE')) return cfg;
    gradle = gradle.replace(/signingConfigs \{/, `signingConfigs {${UPLOAD_SIGNING_CONFIG}`);
    gradle = gradle.replace(
      /(release \{[\s\S]*?)signingConfig signingConfigs\.debug/,
      `$1${RELEASE_SIGNING}`
    );
    cfg.modResults.contents = gradle;
    return cfg;
  });
}

module.exports = (config) => withUploadSigning(withMinify(config));
