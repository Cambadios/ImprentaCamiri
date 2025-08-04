import React, { useState } from 'react';
import axios from 'axios';

const ReportePDF = () => {
  const [tipo, setTipo] = useState('pedidos');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  const handleDescarga = async () => {
    if (!desde || !hasta) {
      alert('Por favor selecciona el rango de fechas.');
      return;
    }

    try {
      const response = await axios.get(`http://localhost:3000/api/reporte-pdf`, {
        params: { tipo, desde, hasta },
        responseType: 'blob', 
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${tipo}-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error al generar el reporte:', error);
      alert('No se pudo generar el PDF.');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '500px', margin: 'auto' }}>
      <h2>Generar Reporte en PDF</h2>
      <div style={{ marginBottom: '1rem' }}>
        <label>Tipo de Reporte: </label>
        <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="pedidos">Pedidos</option>
          <option value="ingresos">Ingresos al Inventario</option>
        </select>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label>Desde: </label>
        <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label>Hasta: </label>
        <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
      </div>
      <button onClick={handleDescarga}>📥 Descargar PDF</button>
    </div>
  );
};

export default ReportePDF;
