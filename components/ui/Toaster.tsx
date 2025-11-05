'use client'

import { Toaster } from 'react-hot-toast'

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        className: 'dashboard-toast',
        duration: 4000,
        style: {
          background: '#ffffff',
          color: '#111827',
          border: '1px solid #d1d5db',
          borderRadius: '0',
          padding: '16px',
          boxShadow: 'none',
          fontFamily: 'var(--font-geist-sans), Arial, Helvetica, sans-serif',
          fontWeight: '500',
          fontSize: '14px',
          maxWidth: '400px',
          minWidth: '300px',
        },
        success: {
          iconTheme: {
            primary: '#111827',
            secondary: '#ffffff',
          },
          style: {
            background: '#ffffff',
            color: '#111827',
            border: '1px solid #d1d5db',
            borderRadius: '0',
            padding: '16px',
            boxShadow: 'none',
          },
        },
        error: {
          iconTheme: {
            primary: '#dc2626',
            secondary: '#ffffff',
          },
          style: {
            background: '#ffffff',
            color: '#111827',
            border: '1px solid #dc2626',
            borderRadius: '0',
            padding: '16px',
            boxShadow: 'none',
          },
        },
      }}
    />
  )
}

