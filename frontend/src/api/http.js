export const ROOT = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/+$/, "");

function buildUrl(path = "") {
  const p = String(path).startsWith("/") ? path : `/${path}`;
  return `${ROOT}${p}`;
}

// Agrega Authorization si existe token y normaliza a /api/*
export async function apiFetch(path, opts = {}) {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json", ...(opts.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const url = buildUrl(`/api${String(path).startsWith("/") ? path : `/${path}`}`);
  
  try {
    const response = await fetch(url, { ...opts, headers });
    
    if (response.status === 401) {
      // Redirige al login si el estado es 401
      window.location.href = "/login"; // Cambia esta ruta si el login tiene otra URL
      return; // Salimos de la función para evitar continuar
    }

    return response;
  } catch (error) {
    console.error("Error en la solicitud:", error);
    throw error; // Propaga el error si es necesario
  }
}
