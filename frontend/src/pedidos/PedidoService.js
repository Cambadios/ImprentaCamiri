// src/pedidos/PedidoService.js

const API_URL = 'http://localhost:3000/api/pedidos';  // Cambia la URL si es necesario

// Función para obtener todos los pedidos
export const getPedidos = async () => {
  try {
    const response = await fetch(API_URL);
    return await response.json();
  } catch (error) {
    console.error('Error al obtener los pedidos', error);
  }
};

// Función para crear un nuevo pedido
export const createPedido = async (pedidoData) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pedidoData),
    });

    if (response.ok) {
      console.log('Pedido creado correctamente');
      return await response.json();  // Devolver la respuesta del servidor
    } else {
      console.error('Error al crear el pedido');
      throw new Error('Error al crear el pedido');
    }
  } catch (error) {
    console.error('Error al crear el pedido', error);
  }
};

// Función para eliminar un pedido
export const deletePedido = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      console.log('Pedido eliminado correctamente');
      return await response.json();
    } else {
      console.error('Error al eliminar el pedido');
      throw new Error('Error al eliminar el pedido');
    }
  } catch (error) {
    console.error('Error al eliminar el pedido', error);
  }
};
