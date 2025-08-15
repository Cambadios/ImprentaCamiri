// src/components/ClientesPage.jsx
import React, { useState, useEffect } from 'react';
import ClientesList from './ClientesList';
import ClienteForm from './ClientesForm';
import { apiFetch } from '../../../api/http'; // Asegúrate de que apiFetch esté correctamente importado
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

const ClientesPage = () => {
  const [clientes, setClientes] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [clienteEdit, setClienteEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // Estado para la búsqueda

  // Obtener lista de clientes
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await apiFetch('/clientes');
        const data = await response.json();
        setClientes(data.data);
      } catch (error) {
        console.error("Error al obtener clientes", error);
      }
    };
    fetchClientes();
  }, []);

  // Función de búsqueda
  const filteredClientes = clientes.filter((cliente) => 
    cliente.telefono.includes(searchTerm) || cliente.apellido.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (cliente) => {
    setClienteEdit(cliente);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await apiFetch(`/clientes/${id}`, { method: 'DELETE' });
      setClientes((prevClientes) => prevClientes.filter((cliente) => cliente._id !== id));
    } catch (error) {
      console.error("Error al eliminar cliente", error);
    }
  };

const handleSave = async (cliente) => {
  try {
    if (clienteEdit) {
      // Editar cliente
      const response = await apiFetch(`/clientes/${clienteEdit._id}`, {
        method: 'PUT',
        body: JSON.stringify(cliente),
      });
      const updatedCliente = await response.json();
      setClientes((prev) =>
        prev.map((c) => (c._id === updatedCliente._id ? updatedCliente : c))
      );
    } else {
      // Crear cliente
      const response = await apiFetch('/clientes', {
        method: 'POST',
        body: JSON.stringify(cliente),
      });
      const newCliente = await response.json();
      setClientes((prev) => [...prev, newCliente]);
    }
    
    // Limpiar el estado clienteEdit después de guardar
    setClienteEdit(null);  // Esto asegura que no se muestren los datos del cliente anterior.
    
    setModalVisible(false); // Cerrar el modal
  } catch (error) {
    console.error("Error al guardar cliente", error);
  }
};


  const handleModalHide = () => {
    setModalVisible(false);
    setClienteEdit(null);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold text-gray-700">Gestión de Clientes</h2>
        <Button 
          label="Nuevo Cliente" 
          icon="pi pi-plus" 
          className="p-button-success" 
          onClick={() => setModalVisible(true)} 
        />
      </div>

      {/* Barra de búsqueda */}
      <div className="mb-4">
        <InputText
          type="text"
          placeholder="Buscar por apellido o teléfono"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full "
        />
      </div>

      <ClientesList 
        clientes={filteredClientes} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
      />
      
      <ClienteForm
        visible={isModalVisible}
        onHide={handleModalHide}
        onSave={handleSave}
        clienteEdit={clienteEdit}
      />
    </div>
  );
};

export default ClientesPage;
