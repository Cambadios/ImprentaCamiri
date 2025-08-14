const Usuario = require('src/models/Usuario');
const { HttpError } = require('src/utils/httpError');

async function list() {
  return Usuario.find().select('-contrasena').sort({ createdAt: -1 });
}

async function create(data) {
  if (!data?.correo || !data?.contrasena || !data?.nombreCompleto) {
    throw HttpError.badRequest('nombreCompleto, correo y contrasena son obligatorios');
  }
  const exists = await Usuario.findOne({ correo: data.correo });
  if (exists) throw HttpError.conflict('El correo ya está registrado');
  const user = new Usuario(data);
  await user.save();
  return { _id: user._id };
}

async function update(id, data) {
  const updated = await Usuario.findByIdAndUpdate(id, data, { new: true }).select('-contrasena');
  if (!updated) throw HttpError.notFound('Usuario no encontrado');
  return updated;
}

async function remove(id) {
  const deleted = await Usuario.findByIdAndDelete(id);
  if (!deleted) throw HttpError.notFound('Usuario no encontrado');
  return true;
}

module.exports = { list, create, update, remove };
