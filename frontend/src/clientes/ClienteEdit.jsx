import React, { useState, useEffect } from 'react';
import { getClienteById, updateCliente } from './ClienteService'; // Importar el servicio

function ClienteEdit({ match }) {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [fecha_pedido, setFechaPedido] = useState('');

  useEffect(() => {
    // Obtener los datos del cliente a editar
    const fetchCliente = async () => {
      const cliente = await getClienteById(match.params.id);
      setNombre(cliente.nombre);
      setApellido(cliente.apellido);
      setTelefono(cliente.telefono);
      setFechaPedido(cliente.fecha_pedido);
    };

    fetchCliente();
  }, [match.params.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const clienteData = { nombre, apellido, telefono, fecha_pedido };

    // Actualizar el cliente
    await updateCliente(match.params.id, clienteData);
    alert('Cliente actualizado correctamente');
  };

  return (
    <div>
      <h2>Editar Cliente</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nombre</label>
          <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        </div>
        <div>
          <label>Apellido</label>
          <input type="text" value={apellido} onChange={(e) => setApellido(e.target.value)} required />
        </div>
        <div>
          <label>Teléfono</label>
          <input type="text" value={telefono} onChange={(e) => setTelefono(e.target.value)} required />
        </div>
        <div>
          <label>Fecha de Pedido</label>
          <input type="date" value={fecha_pedido} onChange={(e) => setFechaPedido(e.target.value)} required />
        </div>
        <button type="submit">Actualizar Cliente</button>
      </form>
    </div>
  );
}

export default ClienteEdit;
