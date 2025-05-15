import React, { useState, useEffect } from 'react';
import { getClientes, deleteCliente } from './ClienteService';  
import VolverPrincipal from '../comunes/VolverPrincipal'; // Ajusta la ruta si es necesario
import { Link } from 'react-router-dom';
import './cliente.css';

function ClienteList() {
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    const fetchClientes = async () => {
      const data = await getClientes();
      setClientes(data);
    };
    fetchClientes();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('¿Estás seguro de que quieres eliminar este cliente?');
    if (confirmDelete) {
      await deleteCliente(id);
      const updatedClientes = await getClientes();
      setClientes(updatedClientes);
    }
  };

  return (
    <div>
      <VolverPrincipal />

      <h2>Lista de Clientes</h2>

      <Link to="/clientes/agregar">
        <button>Agregar Cliente</button>
      </Link>

      <ul>
        {clientes.map(cliente => (
          <li key={cliente._id}>
            {cliente.nombre} {cliente.apellido} - {cliente.telefono}
            <button onClick={() => handleDelete(cliente._id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ClienteList;
