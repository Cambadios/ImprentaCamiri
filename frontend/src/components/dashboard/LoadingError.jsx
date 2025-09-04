import React from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { Button } from 'primereact/button';

/**
 * LoadingError
 * Props:
 * - loading: boolean
 * - error: any                      // Error objeto, string o respuesta HTTP
 * - children: ReactNode
 * - height?: number                 // alto del contenedor en px (default 220)
 * - retry?: () => void              // opcional: acción de reintentar
 * - compact?: boolean               // si true, spinner más pequeño sin forzar altura
 */
export default function LoadingError({
  loading,
  error,
  children,
  height = 220,
  retry,
  compact = false,
}) {
  // Extrae mensaje de error de distintas formas comunes (Error, Axios, fetch, string)
  const errorText =
    (typeof error === 'string' && error) ||
    error?.message ||
    error?.data?.message ||
    error?.response?.data?.message ||
    error?.toString?.() ||
    'Error al cargar';

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center ${compact ? '' : 'w-full'}`}
        style={compact ? {} : { height }}
        aria-busy="true"
        aria-live="polite"
      >
        <ProgressSpinner style={compact ? { width: 28, height: 28 } : { width: 42, height: 42 }} />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 px-3 ${compact ? '' : 'w-full'}`}
        style={compact ? {} : { height }}
        role="alert"
        aria-live="assertive"
      >
        <Message severity="error" text={errorText} />
        {retry && (
          <Button
            label="Reintentar"
            icon="pi pi-refresh"
            text
            onClick={retry}
            aria-label="Reintentar"
          />
        )}
      </div>
    );
  }

  return <>{children}</>;
}
