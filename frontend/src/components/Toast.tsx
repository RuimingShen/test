import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#fff',
          color: '#333',
          boxShadow: '0 4px 20px rgba(255, 36, 66, 0.15)',
          borderRadius: '12px',
          padding: '12px 20px',
          fontSize: '14px',
        },
        success: {
          iconTheme: {
            primary: '#22c55e',
            secondary: '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ff2442',
            secondary: '#fff',
          },
        },
      }}
    />
  );
}
