import { createContext, ReactNode, RefObject, useContext, useEffect, useMemo, useRef } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { Rect, TourTargetId } from './tourSteps';

type Registry = {
  register: (id: TourTargetId, ref: RefObject<View | null>) => () => void;
  measure: (id: TourTargetId, onRect: (rect: Rect) => void) => void;
};

const TourTargetsContext = createContext<Registry | null>(null);

// Registro de las zonas que el tour puede iluminar. Vive en el layout raíz
// para que el botón de reglas de la cabecera también sea una zona.
export function TourTargetsProvider({ children }: { children: ReactNode }) {
  // Por id, una pila: la cabecera de cada pantalla apilada registra su propio
  // botón de reglas y el visible es el último montado.
  const targets = useRef(new Map<TourTargetId, RefObject<View | null>[]>());
  const registry = useMemo<Registry>(
    () => ({
      register: (id, ref) => {
        const stack = targets.current.get(id) ?? [];
        targets.current.set(id, [...stack, ref]);
        return () => {
          const current = targets.current.get(id) ?? [];
          targets.current.set(
            id,
            current.filter((r) => r !== ref)
          );
        };
      },
      measure: (id, onRect) => {
        const stack = targets.current.get(id) ?? [];
        const view = stack[stack.length - 1]?.current;
        view?.measureInWindow((x, y, width, height) => {
          if (width > 0 && height > 0) onRect({ x, y, width, height });
        });
      },
    }),
    []
  );
  return <TourTargetsContext.Provider value={registry}>{children}</TourTargetsContext.Provider>;
}

export function useTourTargets(): Registry | null {
  return useContext(TourTargetsContext);
}

type TargetProps = {
  id: TourTargetId;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function TourTarget({ id, children, style }: TargetProps) {
  const registry = useTourTargets();
  const ref = useRef<View>(null);
  useEffect(() => registry?.register(id, ref), [id, registry]);
  return (
    <View ref={ref} collapsable={false} style={style}>
      {children}
    </View>
  );
}
