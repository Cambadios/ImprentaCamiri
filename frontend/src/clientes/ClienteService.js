import { urlApi } from "../api/api";

const API_URL = urlApi + '/api/clientes';  // Cambia la URL si es necesario

// Función para obtener todos los clientes
export const getClientes = async () => {
  try {
    const response = await fetch(API_URL);
    return await response.json();
  } catch (error) {
    console.error('Error al obtener los clientes', error);
  }
};

// Función para crear un nuevo cliente
export const createCliente = async (clienteData) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clienteData),
    });

    if (response.ok) {
      console.log("Cliente creado correctamente");
      return await response.json();
    } else {
      console.error('Error al crear el cliente');
      throw new Error('Error al crear el cliente');
    }
  } catch (error) {
    console.error('Error al crear el cliente', error);
  }
};

// Función para eliminar un cliente
export const deleteCliente = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      console.log('Cliente eliminado correctamente');
      return await response.json();
    } else {
      console.error('Error al eliminar el cliente');
      throw new Error('Error al eliminar el cliente');
    }
  } catch (error) {
    console.error('Error al eliminar el cliente', error);
  }
};
