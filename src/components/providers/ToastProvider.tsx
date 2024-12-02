'use client';

import { Toaster, ToasterProps } from 'sonner';

export function ToastProvider() {
  const toasterProps: ToasterProps = {
    position: "top-right",
    toastOptions: {
      style: {
        background: '#191919',
        color: '#fff',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      },
      classNames: {
        success: 'bg-[#1a2e1a] border-[rgba(34,197,94,0.2)]',
        error: 'bg-[#2a1616] border-[rgba(239,68,68,0.2)]',
      }
    }
  };

  return <Toaster {...toasterProps} />;
} 