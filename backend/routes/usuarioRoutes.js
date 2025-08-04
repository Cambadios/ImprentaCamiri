const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const Usuario = require('../models/usuario');

// Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const usuarios = await Usuario.find().select('-contrasena');
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener usuarios', error: error.message });
  }
});

// Obtener usuario por ID
router.get('/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener usuario', error: error.message });
  }
});

// ✅ Crear usuario (con nombreCompleto y demás campos)
router.post('/', async (req, res) => {
  try {
    const {
      nombreCompleto,
      correo,
      contrasena,
      telefono,
      carnetIdentidad,
      rol
    } = req.body;

    if (!nombreCompleto || !correo || !contrasena) {
      return res.status(400).json({ mensaje: 'Faltan campos obligatorios' });
    }

    const correoExistente = await Usuario.findOne({ correo });
    if (correoExistente) return res.status(400).json({ mensaje: 'Correo ya registrado' });

    const nuevoUsuario = new Usuario({
      nombreCompleto,                // CAMBIO CORRECTO
      correo,
      contrasena,                    // El hash se aplica desde el modelo
      telefono,
      carnetIdentidad,
      rol: rol === 'admin' ? 'admin' : 'usuario',
    });

    await nuevoUsuario.save();
    res.status(201).json({ mensaje: 'Usuario creado correctamente', usuario: nuevoUsuario });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear usuario', error: error.message });
  }
});

// Actualizar usuario
router.put('/:id', async (req, res) => {
  try {
    const { nombreCompleto, correo, telefono, carnetIdentidad, rol } = req.body;

    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      req.params.id,
      { nombreCompleto, correo, telefono, carnetIdentidad, rol },
      { new: true }
    );

    if (!usuarioActualizado) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.json(usuarioActualizado);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar usuario', error: error.message });
  }
});

// ✅ Login
router.post('/login', async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      return res.status(400).json({ mensaje: 'Correo y contraseña son requeridos' });
    }

    const usuario = await Usuario.findOne({ correo });
    if (!usuario || !usuario.contrasena) {
      return res.status(401).json({ mensaje: 'Usuario no encontrado o sin contraseña' });
    }

    const match = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!match) return res.status(401).json({ mensaje: 'Contraseña incorrecta' });

    res.json({ mensaje: "Login exitoso", nombre: usuario.nombreCompleto, rol: usuario.rol });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el login', error: error.message });
  }
});

// Eliminar usuario
router.delete('/:id', async (req, res) => {
  try {
    const eliminado = await Usuario.findByIdAndDelete(req.params.id);
    if (!eliminado) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.json({ mensaje: 'Usuario eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al eliminar usuario', error: err.message });
  }
});

// Recuperar contraseña - Enviar token
router.post('/olvide-contrasena', async (req, res) => {
  const { correo } = req.body;
  try {
    const usuario = await Usuario.findOne({ correo });
    if (!usuario) return res.status(404).json({ mensaje: 'Correo no registrado' });

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = Date.now() + 1000 * 60 * 15;

    usuario.resetToken = token;
    usuario.resetTokenExpiry = expiry;
    await usuario.save();

    const link = `http://localhost:3000/restablecer-contrasena/${token}`;
    console.log('🔗 Link de recuperación:', link);

    res.json({ mensaje: 'Se envió un enlace de recuperación (simulado)', token });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

// Recuperar contraseña - Restablecer
router.post('/restablecer-contrasena/:token', async (req, res) => {
  const { token } = req.params;
  const { nuevaContrasena } = req.body;

  try {
    const usuario = await Usuario.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!usuario) return res.status(400).json({ mensaje: 'Token inválido o expirado' });

    usuario.contrasena = await bcrypt.hash(nuevaContrasena, 10);
    usuario.resetToken = null;
    usuario.resetTokenExpiry = null;
    await usuario.save();

    res.json({ mensaje: 'Contraseña actualizada correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

module.exports = router;
