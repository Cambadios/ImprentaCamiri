import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import LoadingError from './LoadingError';
import { useApi } from '../../hooks/useApi';

export default function LowStockTable({ umbral = 10 }) {
  const { data, error, loading } = useApi(
    `/dashboard/inventario/bajo-stock?umbral=${umbral}`,
    [umbral]
  );

  const rows = data?.data || [];

  // Render personalizado para cantidad
  const cantidadTemplate = (row) => {
    const cant = row.cantidadDisponible ?? 0;
    let color = 'text-gray-800'; // normal
    if (cant <= umbral) {
      color = 'text-red-600 font-bold'; // crítico
    } else if (cant <= umbral * 1.5) {
      color = 'text-amber-600 font-semibold'; // advertencia
    }
    return <span className={color}>{cant}</span>;
  };

  return (
    <Card
      title={`Stock bajo (≤ ${umbral})`}
      className="rounded-2xl shadow-xl p-3"
    >
      <LoadingError loading={loading} error={error} height={360}>
        <DataTable
          value={rows}
          paginator
          rows={10}
          size="small"
          className="text-base" // <- letras más grandes
          emptyMessage="No hay materiales con stock bajo."
          stripedRows
          responsiveLayout="scroll"
        >
          <Column field="nombre" header="Material" sortable />
          <Column field="categoria" header="Categoría" sortable />
          <Column
            field="cantidadDisponible"
            header="Cantidad"
            body={cantidadTemplate}
            sortable
          />
          <Column field="unidadDeMedida" header="Unidad" />
        </DataTable>
      </LoadingError>
    </Card>
  );
}
