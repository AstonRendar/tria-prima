import { useNavigation } from 'expo-router';
import { usePreventRemove } from 'expo-router/react-navigation';
import { useConfirm } from '@/ui/ConfirmProvider';
import { useBeforeUnloadWarning } from '@/ui/hooks/useBeforeUnloadWarning';

// Con una partida en curso, cualquier salida de la pantalla (flecha de la
// cabecera, botón atrás de Android, gesto de iOS o recarga en web) pide
// confirmación antes de perderla.
export function useExitGuard(active: boolean, title: string): void {
  const navigation = useNavigation();
  const confirm = useConfirm();
  useBeforeUnloadWarning(active);
  usePreventRemove(active, ({ data }) => {
    confirm({
      title,
      message: 'Se perderá la partida en curso. ¿Quieres salir al menú principal?',
      confirmLabel: 'Salir',
      destructive: true,
      onConfirm: () => navigation.dispatch(data.action),
    });
  });
}
