// Preferencias de audio en localStorage (solo web). Ausencia de valor = activado.
export function readFlag(key: string): boolean {
  try {
    return window.localStorage.getItem(key) !== '0';
  } catch {
    return true;
  }
}

export function writeFlag(key: string, on: boolean): void {
  try {
    window.localStorage.setItem(key, on ? '1' : '0');
  } catch {
    // Sin almacenamiento disponible: la preferencia vive solo en la sesión.
  }
}
