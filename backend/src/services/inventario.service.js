const Inventario = require('src/models/Inventario');
const { HttpError } = require('src/utils/httpError');

function list() {
  return Inventario.find().sort({ createdAt: -1 });
}

async function create(data) {
  if (!data?.nombre || data?.cantidad == null || !data?.descripcion) {
    throw HttpError.badRequest('nombre, cantidad y descripcion son obligatorios');
  }
  const item = new Inventario(data);
  await item.save();
  return item;
}

async function update(id, data) {
  const updated = await Inventario.findByIdAndUpdate(id, data, { new: true });
  if (!updated) throw HttpError.notFound('Producto de inventario no encontrado');
  return updated;
}

async function remove(id) {
  const deleted = await Inventario.findByIdAndDelete(id);
  if (!deleted) throw HttpError.notFound('Producto de inventario no encontrado');
  return true;
}

module.exports = { list, create, update, remove };
