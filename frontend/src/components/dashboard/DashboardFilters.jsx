import React from 'react';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';

/**
 * Filtros de rango de fechas para el Dashboard.
 * Props:
 * - from: Date
 * - to: Date
 * - setFrom: Function
 * - setTo: Function
 * - onRefresh: Function (refresca los datos)
 */
export default function DashboardFilters({ from, to, setFrom, setTo, onRefresh }) {
  return (
    <div className="flex flex-wrap items-end gap-4 p-4 bg-white rounded-xl shadow-md mb-6">
      <div className="flex flex-col">
        <label className="text-sm text-gray-600">Desde</label>
        <Calendar 
          value={from}
          onChange={(e) => setFrom(e.value)}
          dateFormat="yy-mm-dd"
          showIcon
          className="w-full"
        />
      </div>
      <div className="flex flex-col">
        <label className="text-sm text-gray-600">Hasta</label>
        <Calendar 
          value={to}
          onChange={(e) => setTo(e.value)}
          dateFormat="yy-mm-dd"
          showIcon
          className="w-full"
        />
      </div>
      <Button
        label="Actualizar"
        icon="pi pi-refresh"
        onClick={onRefresh}
        className="w-full md:w-auto"
      />
    </div>
  );
}
