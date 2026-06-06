import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { ConfirmDialog } from './components/ConfirmDialog';

export type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
};

type ConfirmFn = (opts: ConfirmOptions) => void;

const ConfirmContext = createContext<ConfirmFn | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);

  const open = useCallback<ConfirmFn>((o) => setOpts(o), []);

  const close = useCallback(() => setOpts(null), []);

  const onConfirm = useCallback(() => {
    if (!opts) return;
    const fn = opts.onConfirm;
    close();
    fn();
  }, [opts, close]);

  const onCancel = useCallback(() => {
    if (!opts) return;
    const fn = opts.onCancel;
    close();
    fn?.();
  }, [opts, close]);

  const value = useMemo(() => open, [open]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <ConfirmDialog
        visible={opts !== null}
        title={opts?.title ?? ''}
        message={opts?.message ?? ''}
        confirmLabel={opts?.confirmLabel}
        cancelLabel={opts?.cancelLabel}
        destructive={opts?.destructive}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  const fn = useContext(ConfirmContext);
  if (!fn) throw new Error('useConfirm must be used within ConfirmProvider');
  return fn;
}
