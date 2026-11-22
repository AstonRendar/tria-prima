import AsyncStorage from '@react-native-async-storage/async-storage';

// Preferencias persistentes (audio, tutorial visto). Se cargan una vez al
// arrancar la app (`loadPreferences`) y después se leen en memoria de forma
// síncrona; cada escritura se guarda en segundo plano. Ausencia de valor =
// el valor por defecto de quien lee.
const cache = new Map<string, boolean>();

export async function loadPreferences(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const entries = await AsyncStorage.multiGet(keys);
    for (const [key, value] of entries) {
      if (value !== null) cache.set(key, value === '1');
    }
  } catch {
    // Sin almacenamiento disponible: se usan los valores por defecto.
  }
}

export function readFlag(key: string, fallback: boolean = true): boolean {
  return cache.get(key) ?? fallback;
}

export function writeFlag(key: string, on: boolean): void {
  cache.set(key, on);
  AsyncStorage.setItem(key, on ? '1' : '0').catch(() => {});
}
