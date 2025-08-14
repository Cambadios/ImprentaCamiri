const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/usuario');
const { HttpError } = require('../utils/httpError');

async function login({ correo, contrasena }) {
  if (!correo || !contrasena) {
    throw HttpError.badRequest('Correo y contraseña son obligatorios');
  }

  // Trae el usuario + contraseña aunque esté select:false
  const user = await Usuario.findOne({ correo }).select('+contrasena +contraseña');
  if (!user) {
    throw HttpError.badRequest('Usuario no encontrado');
  }

  // Verifica contraseña con el método del modelo si existe
  let ok = false;
  if (typeof user.compararContrasena === 'function') {
    ok = await user.compararContrasena(contrasena);
  } else {
    const hash = user.contrasena ?? user['contraseña'];
    if (!hash) {
      // Campo de contraseña inexistente → schema inconsistente
      throw HttpError.server('Configuración de contraseña inválida en el modelo de Usuario');
    }
    ok = await bcrypt.compare(contrasena, hash);
  }

  if (!ok) throw HttpError.badRequest('Credenciales inválidas');

  // JWT
  if (!process.env.JWT_SECRET) {
    throw HttpError.server('Falta JWT_SECRET en el servidor');
  }
  const payload = { id: user._id, rol: user.rol };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

  // Respuesta segura
  const usuario = {
    _id: user._id,
    nombreCompleto: user.nombreCompleto,
    correo: user.correo,
    rol: user.rol,
  };
  return { token, usuario };
}

module.exports = { login };
