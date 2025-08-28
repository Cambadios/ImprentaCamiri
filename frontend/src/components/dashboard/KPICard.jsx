import React from 'react';
import { Card } from 'primereact/card';

export default function KPICard({ title, value, subtitle }) {
  return (
    <Card className="shadow-sm">
      <div className="flex flex-col gap-1">
        <span className="text-sm text-gray-500">{title}</span>
        <span className="text-2xl font-semibold">{value}</span>
        {subtitle && <span className="text-xs text-gray-400">{subtitle}</span>}
      </div>
    </Card>
  );
}
