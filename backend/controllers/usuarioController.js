const crypto = require('crypto');
const Usuario = require('../models/usuario');
const bcrypt = require('bcryptjs');

/**
 * Crear usuario
 */
exports.crearUsuario = async (req, res) => {
  try {
    const { nombreCompleto, correo, contrasena, telefono, carnetIdentidad, rol } = req.body;

    if (!nombreCompleto || !correo || !contrasena || !telefono || !carnetIdentidad) {
      return res.status(400).json({ mensaje: 'Faltan campos obligatorios' });
    }

    const existe = await Usuario.findOne({ correo });
    if (existe) return res.status(400).json({ mensaje: 'El correo ya está registrado' });

    const nuevoUsuario = new Usuario({ nombreCompleto, correo, contrasena, telefono, carnetIdentidad, rol });
    await nuevoUsuario.save();

    // Evitar devolver la contraseña
    const { contrasena: _, ...safeUser } = nuevoUsuario.toObject();
    res.status(201).json({ mensaje: 'Usuario creado correctamente', usuario: safeUser });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ mensaje: error.message });
  }
};

/**
 * Login
 */
exports.loginUsuario = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      return res.status(400).json({ mensaje: 'Correo y contraseña son obligatorios' });
    }

    const usuario = await Usuario.findOne({ correo });
    if (!usuario) return res.status(401).json({ mensaje: 'Correo no registrado' });

    const esValida = await usuario.compararContrasena(contrasena);
    if (!esValida) return res.status(401).json({ mensaje: 'Contraseña incorrecta' });

    res.status(200).json({
      mensaje: 'Login exitoso',
      rol: usuario.rol,
      nombreCompleto: usuario.nombreCompleto,
      id: usuario._id
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ mensaje: error.message });
  }
};

/**
 * Obtener todos los usuarios (sin contraseña)
 */
exports.obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find().select('-contrasena');
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

/**
 * Eliminar usuario
 */
exports.eliminarUsuario = async (req, res) => {
  try {
    await Usuario.findByIdAndDelete(req.params.id);
    res.json({ mensaje: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

/**
 * Actualizar usuario (datos generales, no contraseña)
 */
exports.actualizarUsuario = async (req, res) => {
  try {
    const { nombreCompleto, correo, telefono, carnetIdentidad, rol } = req.body;
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    usuario.nombreCompleto = nombreCompleto ?? usuario.nombreCompleto;
    usuario.correo = correo ?? usuario.correo;
    usuario.telefono = telefono ?? usuario.telefono;
    usuario.carnetIdentidad = carnetIdentidad ?? usuario.carnetIdentidad;
    usuario.rol = rol ?? usuario.rol;

    await usuario.save();
    const { contrasena: _, ...safeUser } = usuario.toObject();
    res.json({ mensaje: 'Usuario actualizado correctamente', usuario: safeUser });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

/**
 * Olvidé mi contraseña: generar token (simulación)
 */
exports.enviarTokenRecuperacion = async (req, res) => {
  const { correo } = req.body;
  try {
    const usuario = await Usuario.findOne({ correo });
    if (!usuario) {
      // Para no revelar si existe o no el correo, puedes responder 200 igualmente.
      return res.status(200).json({ mensaje: 'Si el correo existe, se enviará un enlace de recuperación (simulado).' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    usuario.resetToken = token;
    usuario.resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 min
    await usuario.save();

    console.log('🔗 Enlace de recuperación (simulado):', `http://localhost:5173/restablecer-contrasena/${token}`);
    res.json({ mensaje: 'Se envió un enlace de recuperación al correo (simulado).' });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

/**
 * Restablecer contraseña con token (olvido)
 */
exports.restablecerContrasena = async (req, res) => {
  const { token } = req.params;
  const { nuevaContrasena } = req.body;

  try {
    const usuario = await Usuario.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!usuario) return res.status(400).json({ mensaje: 'Token inválido o expirado' });

    usuario.contrasena = nuevaContrasena; // el pre('save') hará el hash
    usuario.resetToken = null;
    usuario.resetTokenExpiry = null;
    await usuario.save();

    res.json({ mensaje: 'Contraseña actualizada correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

/**
 * Cambio de contraseña dentro de la app (modal):
 * requiere contraseña actual + nueva + confirmación
 */
exports.cambiarContrasena = async (req, res) => {
  try {
    const { userId, contrasenaActual, nuevaContrasena, confirmarContrasena } = req.body;

    if (!userId || !contrasenaActual || !nuevaContrasena || !confirmarContrasena) {
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
    }

    if (nuevaContrasena !== confirmarContrasena) {
      return res.status(400).json({ mensaje: 'La nueva contraseña y su confirmación no coinciden' });
    }

    // reglas mínimas (ajusta a tu gusto)
    const cumpleReglas = /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(nuevaContrasena);
    if (!cumpleReglas) {
      return res.status(400).json({
        mensaje: 'La nueva contraseña debe tener al menos 8 caracteres, 1 mayúscula y 1 número'
      });
    }

    const usuario = await Usuario.findById(userId);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    const esValida = await usuario.compararContrasena(contrasenaActual);
    if (!esValida) return res.status(401).json({ mensaje: 'La contraseña actual es incorrecta' });

    usuario.contrasena = nuevaContrasena; // hook pre('save') hashea
    await usuario.save();

    return res.status(200).json({ mensaje: 'Contraseña actualizada correctamente' });
  } catch (error) {
    return res.status(500).json({ mensaje: error.message });
  }
};
