import React from 'react';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Card } from 'primereact/card';

const granOptions = [
  { label: 'Día', value: 'day' },
  { label: 'Semana', value: 'week' },
  { label: 'Mes', value: 'month' },
  { label: 'Trimestre', value: 'quarter' },
  { label: 'Año', value: 'year' },
];

export default function ReportesFilters({ value, onChange }) {
  const { from, to, gran, limit } = value;

  return (
    <Card title="Filtros">
      <div className="grid grid-cols-12 gap-4 items-end">
        <div className="col-span-12 md:col-span-3">
          <label className="block text-sm mb-2">Desde</label>
          <Calendar
            value={from}
            onChange={e => onChange({ ...value, from: e.value })}
            showIcon
            dateFormat="yy-mm-dd"
            className="w-full"
          />
        </div>
        <div className="col-span-12 md:col-span-3">
          <label className="block text-sm mb-2">Hasta</label>
          <Calendar
            value={to}
            onChange={e => onChange({ ...value, to: e.value })}
            showIcon
            dateFormat="yy-mm-dd"
            className="w-full"
          />
        </div>
        <div className="col-span-12 md:col-span-3">
          <label className="block text-sm mb-2">Granularidad</label>
          <Dropdown
            className="w-full"
            options={granOptions}
            value={gran}
            onChange={e => onChange({ ...value, gran: e.value })}
          />
        </div>
        <div className="col-span-12 md:col-span-3">
          <label className="block text-sm mb-2">Top / Límite</label>
          <InputNumber
            className="w-full"
            value={limit}
            min={1}
            max={100}
            onValueChange={(e) => onChange({ ...value, limit: e.value ?? 10 })}
          />
        </div>
      </div>
    </Card>
  );
}
