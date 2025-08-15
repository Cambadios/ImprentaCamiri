import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast'; // Para mostrar los mensajes de error de forma global

const ClienteForm = ({ visible, onHide, onSave, clienteEdit }) => {
  const [cliente, setCliente] = useState({ nombre: '', apellido: '', telefono: '', correo: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (clienteEdit) {
      setCliente(clienteEdit);  // Rellenar el formulario con los datos del cliente que se está editando
    } else {
      setCliente({ nombre: '', apellido: '', telefono: '', correo: '' });  // Limpiar los campos si es un nuevo cliente
    }
  }, [clienteEdit, visible]);  // Asegurarse de limpiar cuando el modal se cierra o se inicia un nuevo cliente

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCliente((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    const newErrors = {};
    if (!cliente.telefono || cliente.telefono.length > 8) {
      newErrors.telefono = 'El teléfono debe tener máximo 8 dígitos';
    }
    if (!cliente.correo || !cliente.correo.endsWith('@gmail.com')) {
      newErrors.correo = 'El correo debe ser un Gmail';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(cliente);
    setCliente({ nombre: '', apellido: '', telefono: '', correo: '' }); // Limpiar formulario después de guardar
    setErrors({});
  };

  return (
    <Dialog 
      header={clienteEdit ? "Editar Cliente" : "Nuevo Cliente"} 
      visible={visible} 
      style={{ width: '450px' }} 
      onHide={() => { onHide(); setCliente({ nombre: '', apellido: '', telefono: '', correo: '' }); }} // Limpiar los datos cuando se cierra el modal
    >
      <div className="p-fluid space-y-4">
        <div className="p-field">
          <label htmlFor="nombre" className="block text-gray-700">Nombre</label>
          <InputText 
            id="nombre" 
            name="nombre" 
            placeholder='Nombre Completo'
            value={cliente.nombre} 
            onChange={handleInputChange} 
            className={`w-full p-inputtext-sm ${errors.nombre ? 'p-invalid' : ''} border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400`} />
          {errors.nombre && <small className="p-error text-red-600">{errors.nombre}</small>}
        </div>
        
        <div className="p-field">
          <label htmlFor="apellido" className="block text-gray-700">Apellido</label>
          <InputText 
            id="apellido" 
            name="apellido" 
            placeholder='Apellido Completo'
            value={cliente.apellido} 
            onChange={handleInputChange} 
            className={`w-full p-inputtext-sm ${errors.apellido ? 'p-invalid' : ''} border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400`} />
          {errors.apellido && <small className="p-error text-red-600">{errors.apellido}</small>}
        </div>
        
        <div className="p-field">
          <label htmlFor="telefono" className="block text-gray-700">Teléfono</label>
          <InputText
            id="telefono"
            name="telefono"
            placeholder='Ej: 77416785'
            value={cliente.telefono}
            onChange={handleInputChange}
            maxLength={8}
            className={`w-full p-inputtext-sm ${errors.telefono ? 'p-invalid' : ''} border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400`}
          />
          {errors.telefono && <small className="p-error text-red-600">{errors.telefono}</small>}
        </div>

        <div className="p-field">
          <label htmlFor="correo" className="block text-gray-700">Correo</label>
          <InputText
            id="correo"
            name="correo"
            placeholder='Ej: @gmail.com'
            value={cliente.correo}
            onChange={handleInputChange}
            className={`w-full p-inputtext-sm ${errors.correo ? 'p-invalid' : ''} border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400`}
          />
          {errors.correo && <small className="p-error text-red-600">{errors.correo}</small>}
        </div>

        <div className="flex justify-between space-x-2">
          <Button 
            label="Cancelar" 
            onClick={() => { onHide(); setCliente({ nombre: '', apellido: '', telefono: '', correo: '' }); }} // Limpiar cuando se cancela
            className="p-button-outlined text-gray-600 border-gray-300 hover:bg-gray-100 hover:border-gray-400" />
          <Button 
            label="Guardar" 
            onClick={handleSubmit} 
            className="p-button-success text-white bg-yellow-500 hover:bg-yellow-400" />
        </div>
      </div>
    </Dialog>
  );
};

export default ClienteForm;
