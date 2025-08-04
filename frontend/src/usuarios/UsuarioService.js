import { urlApi } from "../api/api";

const API_URL = urlApi + '/api/usuarios';

// Obtener todos los usuarios
export const getUsuarios = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Error al obtener usuarios');
    }
    return await response.json();
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return [];
  }
};

// Crear un nuevo usuario (con nombreCompleto)
export const createUsuario = async (usuarioData) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombreCompleto: usuarioData.nombre,  // 👈 Backend espera "nombreCompleto"
        correo: usuarioData.correo,
        contrasena: usuarioData.contrasena,
        rol: usuarioData.rol,
        telefono: usuarioData.telefono,
        carnetIdentidad: usuarioData.carnetIdentidad,
      }),
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        throw new Error(data.mensaje || data.message || 'Error al crear usuario');
      } else {
        const text = await response.text();
        throw new Error(text || 'Error al crear usuario');
      }
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Actualizar usuario
export const updateUsuario = async (id, usuarioData) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(usuarioData),
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        throw new Error(data.mensaje || data.message || 'Error al actualizar usuario');
      } else {
        const text = await response.text();
        throw new Error(text || 'Error al actualizar usuario');
      }
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Eliminar usuario
export const deleteUsuario = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Error al eliminar usuario');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};
