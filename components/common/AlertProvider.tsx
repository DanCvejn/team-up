import React from 'react';
import FancyAlert from './FancyAlert';

type ShowAlertOptions = {
  title?: string;
  message?: string;
  type?: 'success' | 'error' | 'info';
  primaryText?: string;
};

type ShowConfirmOptions = {
  title?: string;
  message?: string;
  primaryText?: string;
  secondaryText?: string;
};

type AlertContextValue = {
  showAlert: (opts: ShowAlertOptions) => Promise<void>;
  showConfirm: (opts: ShowConfirmOptions) => Promise<boolean>;
};

const AlertContext = React.createContext<AlertContextValue | undefined>(undefined);

export const AlertProvider = ({ children }: { children: React.ReactNode }) => {
  const [visible, setVisible] = React.useState(false);
  const [options, setOptions] = React.useState<any>({});
  const resolverRef = React.useRef<((value: any) => void) | null>(null);

  const showAlert = (opts: ShowAlertOptions) => {
    setOptions({ ...opts, type: opts.type ?? 'info' });
    setVisible(true);
    return new Promise<void>((resolve) => {
      resolverRef.current = resolve;
    });
  };

  const showConfirm = (opts: ShowConfirmOptions) => {
    setOptions({ ...opts, type: 'confirm' });
    setVisible(true);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  };

  // For cancel/dismiss we resolve with false (used by confirm) via handleCancel.

  const handleConfirm = () => {
    setVisible(false);
    if (resolverRef.current) {
      resolverRef.current(true);
      resolverRef.current = null;
    }
    setOptions({});
  };

  const handleCancel = () => {
    setVisible(false);
    if (resolverRef.current) {
      resolverRef.current(false);
      resolverRef.current = null;
    }
    setOptions({});
  };

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}

      <FancyAlert
        visible={visible}
        title={options.title}
        message={options.message}
        type={options.type}
        primaryText={options.primaryText}
        secondaryText={options.secondaryText}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </AlertContext.Provider>
  );
};

export const useAlertContext = () => {
  const ctx = React.useContext(AlertContext);
  if (!ctx) throw new Error('useAlertContext must be used within AlertProvider');
  return ctx;
};

export default AlertContext;
