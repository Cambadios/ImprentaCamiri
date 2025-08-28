import React from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';

export default function LoadingError({ loading, error, children }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <ProgressSpinner />
      </div>
    );
  }
  if (error) {
    return <Message severity="error" text={error.message || 'Error al cargar'} />;
  }
  return children;
}
