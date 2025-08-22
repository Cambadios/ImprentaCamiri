// src/components/ClientesForm.jsx
import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

const onlyDigits = (v) => (v ? String(v).replace(/\D+/g, '') : '');

const ClienteForm = ({ visible, onHide, onSave, clienteEdit }) => {
  const [cliente, setCliente] = useState({ nombre: '', apellido: '', telefono: '', correo: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (clienteEdit) {
      setCliente({
        nombre: clienteEdit.nombre || '',
        apellido: clienteEdit.apellido || '',
        telefono: clienteEdit.telefono || '',
        correo: clienteEdit.correo || '',
      });
    } else {
      setCliente({ nombre: '', apellido: '', telefono: '', correo: '' });
    }
  }, [clienteEdit, visible]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Normaliza teléfono a dígitos
    if (name === 'telefono') {
      const digits = onlyDigits(value);
      setCliente((prev) => ({ ...prev, telefono: digits }));
    } else {
      setCliente((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = () => {
    const newErrors = {};

    if (!cliente.nombre?.trim()) newErrors.nombre = 'El nombre es obligatorio';
    if (!cliente.apellido?.trim()) newErrors.apellido = 'El apellido es obligatorio';

    // Teléfono: 7–12 dígitos (como tu backend)
    const tel = onlyDigits(cliente.telefono);
    if (!tel || tel.length < 7 || tel.length > 12) {
      newErrors.telefono = 'El teléfono debe tener entre 7 y 12 dígitos';
    }

    // Correo: opcional pero si viene debe ser válido
    const correo = (cliente.correo || '').trim();
    if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      newErrors.correo = 'El correo no es válido';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      ...cliente,
      telefono: tel, // aseguramos dígitos
      correo: correo || undefined, // si está vacío, mejor no enviar
    });

    setCliente({ nombre: '', apellido: '', telefono: '', correo: '' });
    setErrors({});
  };

  const handleClose = () => {
    onHide();
    setCliente({ nombre: '', apellido: '', telefono: '', correo: '' });
    setErrors({});
  };

  return (
    <Dialog
      header={clienteEdit ? 'Editar Cliente' : 'Nuevo Cliente'}
      visible={visible}
      style={{ width: '450px' }}
      onHide={handleClose}
    >
      <div className="p-fluid space-y-4">
        <div className="p-field">
          <label htmlFor="nombre" className="block text-gray-700">Nombre</label>
          <InputText
            id="nombre"
            name="nombre"
            placeholder="Nombre Completo"
            value={cliente.nombre}
            onChange={handleInputChange}
            className={`w-full p-inputtext-sm ${errors.nombre ? 'p-invalid' : ''} border-2 border-gray-300 rounded-md`}
          />
          {errors.nombre && <small className="p-error text-red-600">{errors.nombre}</small>}
        </div>

        <div className="p-field">
          <label htmlFor="apellido" className="block text-gray-700">Apellido</label>
          <InputText
            id="apellido"
            name="apellido"
            placeholder="Apellido Completo"
            value={cliente.apellido}
            onChange={handleInputChange}
            className={`w-full p-inputtext-sm ${errors.apellido ? 'p-invalid' : ''} border-2 border-gray-300 rounded-md`}
          />
          {errors.apellido && <small className="p-error text-red-600">{errors.apellido}</small>}
        </div>

        <div className="p-field">
          <label htmlFor="telefono" className="block text-gray-700">Teléfono</label>
          <InputText
            id="telefono"
            name="telefono"
            placeholder="Ej: 77416785"
            value={cliente.telefono}
            onChange={handleInputChange}
            maxLength={12} // 7–12
            className={`w-full p-inputtext-sm ${errors.telefono ? 'p-invalid' : ''} border-2 border-gray-300 rounded-md`}
          />
          {errors.telefono && <small className="p-error text-red-600">{errors.telefono}</small>}
        </div>

        <div className="p-field">
          <label htmlFor="correo" className="block text-gray-700">Correo</label>
          <InputText
            id="correo"
            name="correo"
            placeholder="Ej: usuario@dominio.com"
            value={cliente.correo}
            onChange={handleInputChange}
            className={`w-full p-inputtext-sm ${errors.correo ? 'p-invalid' : ''} border-2 border-gray-300 rounded-md`}
          />
          {errors.correo && <small className="p-error text-red-600">{errors.correo}</small>}
        </div>

        <div className="flex justify-between space-x-2">
          <Button
            label="Cancelar"
            onClick={handleClose}
            className="p-button-outlined p-button-secondary"
          />
          <Button
            label="Guardar"
            onClick={handleSubmit}
            className="p-button-success"
          />
        </div>
      </div>
    </Dialog>
  );
};

export default ClienteForm;
