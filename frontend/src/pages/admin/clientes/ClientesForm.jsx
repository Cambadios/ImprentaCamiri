// src/components/ClientesForm.jsx
import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

const onlyDigits = (v) => (v ? String(v).replace(/\D+/g, '') : '');

const ClienteForm = ({ visible, onHide, onSave, clienteEdit }) => {
  const [cliente, setCliente] = useState({ ci: '', nombre: '', apellido: '', telefono: '', correo: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (clienteEdit) {
      setCliente({
        ci: clienteEdit.ci || '',
        nombre: clienteEdit.nombre || '',
        apellido: clienteEdit.apellido || '',
        telefono: clienteEdit.telefono || '',
        correo: clienteEdit.correo || '',
      });
    } else {
      setCliente({ ci: '', nombre: '', apellido: '', telefono: '', correo: '' });
    }
    setErrors({});
    setApiError('');
  }, [clienteEdit, visible]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'telefono' || name === 'ci') {
      setCliente((prev) => ({ ...prev, [name]: onlyDigits(value) }));
    } else {
      setCliente((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validate = () => {
    const newErrors = {};
    // CI requerido: 5–12 dígitos (ajusta si tu backend usa otro rango)
    const ci = onlyDigits(cliente.ci);
    if (!ci || ci.length < 5 || ci.length > 12) {
      newErrors.ci = 'El CI debe tener entre 5 y 12 dígitos';
    }

    if (!cliente.nombre?.trim()) newErrors.nombre = 'El nombre es obligatorio';
    if (!cliente.apellido?.trim()) newErrors.apellido = 'El apellido es obligatorio';

    // Teléfono opcional: si hay valor, 7–12 dígitos
    const tel = onlyDigits(cliente.telefono);
    if (cliente.telefono && (tel.length < 7 || tel.length > 12)) {
      newErrors.telefono = 'El teléfono debe tener entre 7 y 12 dígitos';
    }

    // Correo opcional: si viene, válido
    const correo = (cliente.correo || '').trim();
    if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      newErrors.correo = 'El correo no es válido';
    }

    setErrors(newErrors);
    return { ok: Object.keys(newErrors).length === 0, ci, tel, correo };
  };

  const handleSubmit = async () => {
    setApiError('');
    const { ok, ci, tel, correo } = validate();
    if (!ok) return;

    try {
      await onSave({
        ...cliente,
        ci,
        telefono: tel || undefined,      // si quedó vacío, no enviar
        correo: correo || undefined,
      });
      setCliente({ ci: '', nombre: '', apellido: '', telefono: '', correo: '' });
      setErrors({});
    } catch (e) {
      // Expect: { message, field } desde el backend en duplicados (E11000)
      const msg = e?.message || 'Error al guardar';
      setApiError(msg);
      // Si nos dicen qué campo falló, marcamos el error en ese campo
      if (e?.field) {
        setErrors((prev) => ({ ...prev, [e.field]: msg }));
      }
    }
  };

  const handleClose = () => {
    onHide();
    setCliente({ ci: '', nombre: '', apellido: '', telefono: '', correo: '' });
    setErrors({});
    setApiError('');
  };

  return (
    <Dialog
      header={clienteEdit ? 'Editar Cliente' : 'Nuevo Cliente'}
      visible={visible}
      style={{ width: '480px' }}
      onHide={handleClose}
    >
      <div className="p-fluid space-y-4">
        {/* CI */}
        <div className="p-field">
          <label htmlFor="ci" className="block text-gray-700">CI (solo números)</label>
          <InputText
            id="ci"
            name="ci"
            placeholder="Ej: 1234567"
            value={cliente.ci}
            onChange={handleInputChange}
            maxLength={12}
            className={`w-full p-inputtext-sm ${errors.ci ? 'p-invalid' : ''} border-2 border-gray-300 rounded-md`}
          />
          {errors.ci && <small className="p-error text-red-600">{errors.ci}</small>}
        </div>

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
          <label htmlFor="telefono" className="block text-gray-700">Teléfono (opcional)</label>
          <InputText
            id="telefono"
            name="telefono"
            placeholder="Ej: 77416785"
            value={cliente.telefono}
            onChange={handleInputChange}
            maxLength={12}
            className={`w-full p-inputtext-sm ${errors.telefono ? 'p-invalid' : ''} border-2 border-gray-300 rounded-md`}
          />
          {errors.telefono && <small className="p-error text-red-600">{errors.telefono}</small>}
        </div>

        <div className="p-field">
          <label htmlFor="correo" className="block text-gray-700">Correo (opcional)</label>
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

        {apiError && <div className="p-error text-red-600">{apiError}</div>}

        <div className="flex justify-between space-x-2">
          <Button label="Cancelar" onClick={handleClose} className="p-button-outlined p-button-secondary" />
          <Button label="Guardar" onClick={handleSubmit} className="p-button-success" />
        </div>
      </div>
    </Dialog>
  );
};

export default ClienteForm;
