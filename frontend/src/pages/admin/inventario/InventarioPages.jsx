// src/pages/Inventario/InventarioPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import InventarioList from './InventarioList';
import InventarioForm from './InventarioForm';
import MovimientoModal from './components/MovimientoModal';
import AgregarModal from './components/AgregarModal';
import KardexDrawer from './components/KardexDrawer';
import IngresosModal from './components/IngresosModal';

import { apiFetch } from '../../../api/http';
import { movIngreso, movAgregar, movKardex } from '../../../api/inventarioMov';

import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { downloadFile } from '../../../api/download';

const InventarioPage = () => {
  const [inventarios, setInventarios] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [inventarioEdit, setInventarioEdit] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const debounceRef = useRef();

  // Movimientos (Ingreso por fila)
  const [movTipo, setMovTipo] = useState(null);  // 'INGRESO'
  const [movInsumo, setMovInsumo] = useState(null);
  const [openMov, setOpenMov] = useState(false);

  // Agregar a existente (global)
  const [openAgregar, setOpenAgregar] = useState(false);

  // Kárdex (por insumo)
  const [openKardex, setOpenKardex] = useState(false);
  const [kardexData, setKardexData] = useState(null);

  // Ingresos (listado global en modal)
  const [openIngresos, setOpenIngresos] = useState(false);

  // Cargar lista inicial
  useEffect(() => { fetchInventarios(''); }, []);

  // Búsqueda con debounce
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { fetchInventarios(searchTerm); }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [searchTerm]);

  const fetchInventarios = async (q) => {
    try {
      const path = q ? `/inventario?q=${encodeURIComponent(q)}` : '/inventario';
      const response = await apiFetch(path);
      const data = await response.json();
      setInventarios(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al obtener inventarios', error);
    }
  };

  const handleEdit = (inventario) => { setInventarioEdit(inventario); setModalVisible(true); };

  const handleDelete = async (id) => {
    try {
      await apiFetch(`/inventario/${id}`, { method: 'DELETE' });
      setInventarios(prev => prev.filter(i => i._id !== id));
    } catch (error) {
      console.error('Error al eliminar insumo', error);
    }
  };

  const handleSave = async (payload) => {
    try {
      if (inventarioEdit) {
        const response = await apiFetch(`/inventario/${inventarioEdit._id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
          headers: { 'Content-Type': 'application/json' },
        });
        const updated = await response.json();
        setInventarios(prev => prev.map(i => (i._id === updated._id ? updated : i)));
      } else {
        const response = await apiFetch('/inventario', {
          method: 'POST',
          body: JSON.stringify(payload),
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error('Error al crear el insumo');
        const created = await response.json();
        setInventarios(prev => [created, ...prev]);
      }
      setModalVisible(false);
      setInventarioEdit(null);
    } catch (error) {
      console.error('Error al guardar el insumo', error);
    }
  };

  const handleModalHide = () => { setModalVisible(false); setInventarioEdit(null); };

  // ---------- Handlers de acciones por fila ----------
  const onIngreso = (insumo) => { setMovTipo('INGRESO'); setMovInsumo(insumo); setOpenMov(true); };

  const onKardex = async (insumo) => {
    try {
      const data = await movKardex(insumo._id);
      setKardexData(data);
      setOpenKardex(true);
    } catch (e) { console.error(e); }
  };

  // Confirmaciones de modales
  const confirmMovimiento = async (payload) => {
    try {
      if (movTipo === 'INGRESO') await movIngreso(payload);
      await fetchInventarios(searchTerm);
      setOpenMov(false); setMovInsumo(null); setMovTipo(null);
    } catch (e) { console.error(e); }
  };

  const confirmAgregar = async (payload) => {
    try {
      await movAgregar(payload);
      await fetchInventarios(searchTerm);
      setOpenAgregar(false);
    } catch (e) { console.error(e); }
  };

  return (
    <div className="p-4">
      {/* Encabezado y acciones globales */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold text-gray-700">Lista de Insumos</h2>
        <div className="space-x-2">
          <Button
            label="Ver ingresos"
            icon="pi pi-list"
            className="p-button-info"
            onClick={() => setOpenIngresos(true)}
          />
          <Button
            label="Agregar a existente"
            icon="pi pi-cart-plus"
            className="p-button-help"
            onClick={() => setOpenAgregar(true)}
          />
          <Button
            label="Nuevo Insumo"
            icon="pi pi-plus"
            className="p-button-success"
            onClick={() => setModalVisible(true)}
          />
          <Button
            label="Descargar PDF"
            icon="pi pi-download"
            onClick={() =>
              downloadFile(
                `/api/export/inventario.pdf?q=${encodeURIComponent(searchTerm || '')}`,
                'Listado de Insumos.pdf'
              )
            }
          />
        </div>
      </div>

      {/* Búsqueda */}
      <div className="mb-4">
        <span className="p-input-icon-left w-full">
          <i className="pi pi-search" />
          <InputText
            type="text"
            placeholder="Buscar por nombre, código, marca o descripción"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </span>
      </div>

      {/* Tabla */}
      <InventarioList
        inventarios={inventarios}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onIngreso={onIngreso}
        onKardex={onKardex}
      />

      {/* Modal crear/editar insumo */}
      <InventarioForm
        visible={isModalVisible}
        onHide={handleModalHide}
        onSave={handleSave}
        productoEdit={inventarioEdit}
      />

      {/* Modal de INGRESO por fila */}
      <MovimientoModal
        open={openMov}
        onClose={() => { setOpenMov(false); setMovInsumo(null); setMovTipo(null); }}
        tipo={movTipo}
        insumo={movInsumo}
        onConfirm={confirmMovimiento}
      />

      {/* Modal Agregar a existente (global) */}
      <AgregarModal
        open={openAgregar}
        onClose={() => setOpenAgregar(false)}
        prefill={null}
        onConfirm={confirmAgregar}
      />

      {/* Drawer Kárdex por insumo */}
      <KardexDrawer
        open={openKardex}
        onClose={() => { setOpenKardex(false); setKardexData(null); }}
        data={kardexData}
      />

      {/* Modal Ver Ingresos (global) */}
      <IngresosModal
        open={openIngresos}
        onClose={() => setOpenIngresos(false)}
      />
    </div>
  );
};

export default InventarioPage;
