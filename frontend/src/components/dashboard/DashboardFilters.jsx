import React from 'react';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';

export default function DashboardFilters({ from, to, setFrom, setTo, onRefresh }) {
  return (
    <div className="flex flex-wrap items-end gap-3 p-3 bg-white rounded-xl shadow-sm mb-4">
      <div>
        <label className="text-sm text-gray-600">Desde</label>
        <Calendar value={from} onChange={(e) => setFrom(e.value)} dateFormat="yy-mm-dd" showIcon />
      </div>
      <div>
        <label className="text-sm text-gray-600">Hasta</label>
        <Calendar value={to} onChange={(e) => setTo(e.value)} dateFormat="yy-mm-dd" showIcon />
      </div>
      <Button label="Actualizar" icon="pi pi-refresh" onClick={onRefresh} />
    </div>
  );
}
