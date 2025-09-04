import React from 'react';
import { Card } from 'primereact/card';

// Ejemplo de formatter externo: 
// const currency = new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' });

/**
 * KPICard: indicador compacto para métricas clave.
 * Props:
 * - title: string
 * - value: number|string
 * - subtitle?: string
 * - formatter?: (v:any) => string    // opcional, ej: (v)=>currency.format(v)
 * - loading?: boolean                 // muestra skeleton
 * - error?: string                    // muestra error corto (rojo)
 * - trend?: { delta: number|string, direction: 'up'|'down'|'flat' } // opcional
 * - onClick?: () => void              // si se pasa, la tarjeta es clickable
 * - height?: number                   // alto del contenedor (default 140)
 */
export default function KPICard({
  title,
  value,
  subtitle,
  formatter,
  loading = false,
  error,
  trend,
  onClick,
  height = 140,
}) {
  const formatted = formatter ? formatter(value) : value;

  // Estilos si es clickable
  const clickable = !!onClick;
  const cardClass = `shadow-xl p-3 rounded-2xl ${clickable ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`;

  // Icono simple según tendencia (usa PrimeIcons que ya tienes por PrimeReact)
  const TrendIcon = () => {
    if (!trend?.direction) return null;
    const dir = trend.direction;
    const color =
      dir === 'up' ? 'text-emerald-600' :
      dir === 'down' ? 'text-rose-600' :
      'text-gray-500';
    const icon =
      dir === 'up' ? 'pi pi-arrow-up' :
      dir === 'down' ? 'pi pi-arrow-down' :
      'pi pi-minus';
    return (
      <span className={`inline-flex items-center gap-1 text-xs ${color}`}>
        <i className={icon} />
        <span>{trend.delta}</span>
      </span>
    );
  };

  return (
    <Card className={cardClass} onClick={onClick}>
      <div className="flex flex-col justify-center" style={{ height }}>
        {/* Título */}
        <span className="text-sm text-gray-500">{title}</span>

        {/* Valor / Loading */}
        {loading ? (
          <div className="mt-1">
            <div className="h-7 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
        ) : (
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-semibold leading-none">
              {formatted}
            </span>
            {trend && <TrendIcon />}
          </div>
        )}

        {/* Subtítulo o error */}
        {error ? (
          <span className="mt-1 text-xs text-rose-600">{error}</span>
        ) : (
          subtitle && <span className="mt-1 text-xs text-gray-400">{subtitle}</span>
        )}
      </div>
    </Card>
  );
}
