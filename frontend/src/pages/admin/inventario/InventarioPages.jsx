// src/pages/Inventario/InventarioPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import InventarioList from './InventarioList';
import InventarioForm from './InventarioForm';
import { apiFetch } from '../../../api/http';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { downloadFile } from '../../../api/download';

const InventarioPage = () => {
  const [inventarios, setInventarios] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [inventarioEdit, setInventarioEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const debounceRef = useRef();

  // Cargar lista inicial
  useEffect(() => {
    fetchInventarios('');
  }, []);

  // Búsqueda con debounce al backend (?q=)
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchInventarios(searchTerm);
    }, 350);
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

  const handleEdit = (inventario) => {
    setInventarioEdit(inventario);
    setModalVisible(true);
  };

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
        // Editar (PUT) — el backend acepta marca opcional y categoriaId opcional
        const response = await apiFetch(`/inventario/${inventarioEdit._id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
          headers: { 'Content-Type': 'application/json' },
        });
        const updated = await response.json();
        setInventarios(prev => prev.map(i => (i._id === updated._id ? updated : i)));
      } else {
        // Crear (POST) — el backend espera categoriaId (no "categoria")
        const response = await apiFetch('/inventario', {
          method: 'POST',
          body: JSON.stringify(payload),
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error('Error al crear el insumo');
        const created = await response.json();
        setInventarios(prev => [created, ...prev]); // al inicio
      }
      setModalVisible(false);
      setInventarioEdit(null);
    } catch (error) {
      console.error('Error al guardar el insumo', error);
    }
  };

  const handleModalHide = () => {
    setModalVisible(false);
    setInventarioEdit(null);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold text-gray-700">Lista de Insumos</h2>
        <div className="space-x-4">
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

      {/* Barra de búsqueda (servidor) */}
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

      <InventarioList
        inventarios={inventarios}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <InventarioForm
        visible={isModalVisible}
        onHide={handleModalHide}
        onSave={handleSave}
        productoEdit={inventarioEdit}
      />
    </div>
  );
};

export default InventarioPage;
