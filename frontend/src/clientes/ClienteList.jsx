import React, { useState, useEffect } from 'react';
import { getClientes, deleteCliente } from './ClienteService';  // Importar funciones

function ClienteList() {
  const [clientes, setClientes] = useState([]);

  // Obtener la lista de clientes
  useEffect(() => {
    const fetchClientes = async () => {
      const data = await getClientes();
      setClientes(data);  // Guardamos los clientes en el estado
    };

    fetchClientes();
  }, []); // Solo se ejecuta una vez cuando el componente se monta

  // Eliminar cliente
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('¿Estás seguro de que quieres eliminar este cliente?');
    if (confirmDelete) {
      // Llamar al servicio para eliminar el cliente
      await deleteCliente(id);
      
      // Después de la eliminación, obtenemos la lista actualizada de clientes desde el backend
      const updatedClientes = await getClientes();
      
      // Actualizamos el estado con la lista actualizada (sin el cliente eliminado)
      setClientes(updatedClientes);
    }
  };

  return (
    <div>
      <h2>Lista de Clientes</h2>
      <button onClick={() => window.location.href = '/clientes/agregar'}>Agregar Cliente</button> {/* Botón para agregar cliente */}

      <ul>
        {clientes.map(cliente => (
          <li key={cliente._id}>
            {cliente.nombre} {cliente.apellido} - {cliente.telefono}
            {/* Botón para eliminar cliente */}
            <button onClick={() => handleDelete(cliente._id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ClienteList;
