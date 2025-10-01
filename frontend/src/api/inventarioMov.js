// /src/api/inventarioMov.js
import { apiFetch } from "../api/http";

export async function movIngreso({ insumoId, cantidad, unidadDeMedida, costoUnitario, motivo, referencia }) {
  const res = await apiFetch(`/inventario/movimientos/ingreso`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ insumoId, cantidad: Number(cantidad), unidadDeMedida, costoUnitario, motivo, referencia })
  });
  if (!res.ok) throw new Error('No se pudo registrar el ingreso');
  return res.json();
}

export async function movSalida({ insumoId, cantidad, unidadDeMedida, motivo, referencia }) {
  const res = await apiFetch(`/inventario/movimientos/salida`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ insumoId, cantidad: Number(cantidad), unidadDeMedida, motivo, referencia })
  });
  if (!res.ok) throw new Error('No se pudo registrar la salida');
  return res.json();
}

export async function movAgregar({ insumoId, codigo, nombre, marca, unidadDeMedida, categoriaId, cantidad, costoUnitario, motivo, referencia }) {
  const res = await apiFetch(`/inventario/movimientos/agregar`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ insumoId, codigo, nombre, marca, unidadDeMedida, categoriaId, cantidad: Number(cantidad), costoUnitario, motivo, referencia })
  });
  if (!res.ok) throw new Error('No se pudo agregar stock al insumo existente');
  return res.json();
}

export async function movKardex(insumoId) {
  const res = await apiFetch(`/inventario/movimientos/kardex/${insumoId}`);
  if (!res.ok) throw new Error('No se pudo obtener el kárdex');
  return res.json();
}
