import { useEffect } from 'react';
import { Platform } from 'react-native';

// Dispara el diálogo nativo del navegador al recargar / cerrar pestaña / pulsar
// "atrás" cuando `enabled` es true. En iOS/Android no hace nada (la navegación
// dentro de la app se gestiona desde los componentes con `useConfirm`).
export function useBeforeUnloadWarning(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;
    if (Platform.OS !== 'web') return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [enabled]);
}
