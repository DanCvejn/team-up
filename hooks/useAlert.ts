import { useAlertContext } from '@/components/common/AlertProvider';
import { useCallback } from 'react';

export default function useAlert() {
  const ctx = useAlertContext();

  const alert = useCallback(
    (title: string, message?: string) => ctx.showAlert({ title, message, type: 'info' }),
    [ctx]
  );

  const success = useCallback((title: string, message?: string) => ctx.showAlert({ title, message, type: 'success' }), [ctx]);

  const error = useCallback((title: string, message?: string) => ctx.showAlert({ title, message, type: 'error' }), [ctx]);

  const confirm = useCallback((title?: string, message?: string, primaryText?: string, secondaryText?: string) => {
    return ctx.showConfirm({ title, message, primaryText, secondaryText });
  }, [ctx]);

  return {
    alert,
    success,
    error,
    confirm,
  };
}
