const crypto = require('crypto');
const Usuario = require('../models/usuario');

// ✅ Crear un nuevo usuario
exports.crearUsuario = async (req, res) => {
  try {
    const {
      nombreCompleto,
      correo,
      contrasena,
      telefono,
      carnetIdentidad,
      rol,
    } = req.body;

    if (!nombreCompleto || !correo || !contrasena) {
      return res.status(400).json({ mensaje: 'Faltan campos obligatorios' });
    }

    const existe = await Usuario.findOne({ correo });
    if (existe) {
      return res.status(400).json({ mensaje: 'El correo ya está registrado' });
    }

    const nuevoUsuario = new Usuario({
      nombreCompleto,
      correo,
      contrasena,
      telefono,
      carnetIdentidad,
      rol,
    });

    await nuevoUsuario.save();
    res.status(201).json({ mensaje: 'Usuario creado correctamente', usuario: nuevoUsuario });

  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ mensaje: error.message });
  }
};

// ✅ Obtener todos los usuarios
exports.obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find().select('-contrasena');
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// ✅ Eliminar usuario
exports.eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    await Usuario.findByIdAndDelete(id);
    res.json({ mensaje: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// ✅ Actualizar usuario
exports.actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombreCompleto, correo, telefono, carnetIdentidad, rol } = req.body;

    const usuario = await Usuario.findById(id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    usuario.nombreCompleto = nombreCompleto || usuario.nombreCompleto;
    usuario.correo = correo || usuario.correo;
    usuario.telefono = telefono || usuario.telefono;
    usuario.carnetIdentidad = carnetIdentidad || usuario.carnetIdentidad;
    usuario.rol = rol || usuario.rol;

    await usuario.save();
    res.json({ mensaje: 'Usuario actualizado correctamente', usuario });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// ✅ Recuperar contraseña (ya lo tenías bien)
exports.enviarTokenRecuperacion = async (req, res) => {
  const { correo } = req.body;
  try {
    const usuario = await Usuario.findOne({ correo });
    if (!usuario) {
      return res.status(404).json({ message: 'Correo no registrado' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = Date.now() + 1000 * 60 * 15;

    usuario.resetToken = token;
    usuario.resetTokenExpiry = expiry;
    await usuario.save();

    const link = `http://localhost:3000/restablecer-contrasena/${token}`;
    console.log('🔗 Enlace de recuperación:', link);

    res.json({ message: 'Se envió un enlace de recuperación al correo (simulado).' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Restablecer contraseña (también estaba bien)
exports.restablecerContrasena = async (req, res) => {
  const { token } = req.params;
  const { nuevaContrasena } = req.body;

  try {
    const usuario = await Usuario.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!usuario) {
      return res.status(400).json({ message: 'Token inválido o expirado' });
    }

    usuario.contrasena = nuevaContrasena;
    usuario.resetToken = null;
    usuario.resetTokenExpiry = null;
    await usuario.save();

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
