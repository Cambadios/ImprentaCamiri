// src/components/ClientesPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import ClientesList from "./ClientesList";
import ClienteForm from "./ClientesForm";
import { apiFetch } from "../../../api/http";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { downloadFile } from "../../../api/download";

const ClientesPage = () => {
  const [clientes, setClientes] = useState([]); // SIEMPRE array
  const [isModalVisible, setModalVisible] = useState(false);
  const [clienteEdit, setClienteEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Obtener lista de clientes
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await apiFetch("/clientes");
        const data = await response.json();

        // Soporta { data: [...] } o [...] directo
        const arr = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : [];
        setClientes(arr);
      } catch (error) {
        console.error("Error al obtener clientes", error);
        setClientes([]); // evita undefined
      }
    };
    fetchClientes();
  }, []);

  // Normalizar seguro para búsqueda
  const safeStr = (v) => (v == null ? "" : String(v));

  // Búsqueda segura (apellido/teléfono)
  const filteredClientes = useMemo(() => {
    const term = safeStr(searchTerm).toLowerCase().trim();
    if (!term) return clientes;
    return (clientes ?? []).filter((c) => {
      const tel = safeStr(c?.telefono);
      const ape = safeStr(c?.apellido).toLowerCase();
      return tel.includes(term) || ape.includes(term);
    });
  }, [clientes, searchTerm]);

  const handleEdit = (cliente) => {
    setClienteEdit(cliente);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await apiFetch(`/clientes/${id}`, { method: "DELETE" });
      setClientes((prev) => prev.filter((c) => c._id !== id));
    } catch (error) {
      console.error("Error al eliminar cliente", error);
    }
  };

  const handleSave = async (cliente) => {
    try {
      if (clienteEdit) {
        // Editar cliente
        const response = await apiFetch(`/clientes/${clienteEdit._id}`, {
          method: "PUT",
          body: JSON.stringify(cliente),
        });
        const updated = await response.json();
        setClientes((prev) =>
          prev.map((c) => (c._id === updated._id ? updated : c))
        );
      } else {
        // Crear cliente
        const response = await apiFetch("/clientes", {
          method: "POST",
          body: JSON.stringify(cliente),
        });
        const created = await response.json();
        setClientes((prev) => [...prev, created]);
      }
      setClienteEdit(null);
      setModalVisible(false);
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
        <h2 className="text-3xl font-semibold text-gray-700">
          Gestión de Clientes
        </h2>
        <div className="space-x-4">
          <Button
            label="Nuevo Cliente"
            icon="pi pi-plus"
            className="p-button-success"
            onClick={() => setModalVisible(true)}
          />

          <Button
            label="Descargar PDF"
            icon="pi pi-download"
            onClick={() =>
              downloadFile(
                "/api/export/clientes.pdf",
                "Listado de Clientes.pdf"
              )
            }
          />
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="mb-4">
        <InputText
          type="text"
          placeholder="Buscar por apellido o teléfono"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
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
