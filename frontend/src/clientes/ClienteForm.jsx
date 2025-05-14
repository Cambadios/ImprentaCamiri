import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importa el hook de navegación
import { createCliente } from './ClienteService'; // Importa el servicio para crear el cliente

function ClienteForm() {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [fecha_pedido, setFechaPedido] = useState('');
  const navigate = useNavigate();  // Hook de navegación

  const handleSubmit = async (e) => {
    e.preventDefault();

    const clienteData = { nombre, apellido, telefono, fecha_pedido };

    // Crear cliente
    await createCliente(clienteData);

    // Redirigir a la lista de clientes después de crear el cliente
    navigate('/clientes');
  };

  return (
    <div>
      <h2>Crear Cliente</h2>
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
        <button type="submit">Crear Cliente</button>
      </form>
    </div>
  );
}

export default ClienteForm;
