const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Usuario = require('../models/usuario');

// Obtener todos los usuarios
router.get('/usuario', async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    res.json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ mensaje: 'Error al obtener usuarios', error: error.message });
  }
});

// Obtener usuario por ID
router.get('/usuario/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener usuario', error: error.message });
  }
});

// Crear usuario con validación y contraseña hasheada
router.post('/usuario', async (req, res) => {
  try {
    const { nombreCompleto, correo, telefono, carnetIdentidad, contraseña, rol } = req.body;

    // Validar campos obligatorios
    if (!nombreCompleto || !correo || !telefono || !carnetIdentidad || !contraseña) {
      return res.status(400).json({ mensaje: 'Faltan campos obligatorios' });
    }

    // Validar duplicados
    const correoExistente = await Usuario.findOne({ correo });
    if (correoExistente) {
      return res.status(400).json({ mensaje: 'Correo ya registrado' });
    }

    const telefonoExistente = await Usuario.findOne({ telefono });
    if (telefonoExistente) {
      return res.status(400).json({ mensaje: 'Teléfono ya registrado' });
    }

    const carnetExistente = await Usuario.findOne({ carnetIdentidad });
    if (carnetExistente) {
      return res.status(400).json({ mensaje: 'Carnet ya registrado' });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    // Crear nuevo usuario
    const nuevoUsuario = new Usuario({
      nombreCompleto,
      correo,
      telefono,
      carnetIdentidad,
      contraseña: hashedPassword,
      rol: (rol === 'admin' || rol === 'administrador') ? 'administrador' : 'usuario_normal', // Normaliza rol
    });

    await nuevoUsuario.save();
    res.status(201).json({ mensaje: 'Usuario creado correctamente', usuario: nuevoUsuario });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ mensaje: 'Error al crear usuario', error: error.message });
  }
});

// Actualizar usuario por ID
router.put('/usuario/:id', async (req, res) => {
  try {
    const { nombreCompleto, correo, telefono, carnetIdentidad, rol } = req.body;

    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      req.params.id,
      { nombreCompleto, correo, telefono, carnetIdentidad, rol },
      { new: true }
    );

    if (!usuarioActualizado) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    res.json(usuarioActualizado);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ mensaje: 'Error al actualizar usuario', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { correo, contraseña } = req.body;

    if (!correo || !contraseña) {
      return res.status(400).json({ mensaje: 'Correo y contraseña son requeridos' });
    }

    const usuario = await Usuario.findOne({ correo });
    if (!usuario) return res.status(401).json({ mensaje: 'Usuario no encontrado' });

    const match = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!match) return res.status(401).json({ mensaje: 'Contraseña incorrecta' });

    res.json({ mensaje: "Login exitoso", nombreCompleto: usuario.nombreCompleto, rol: usuario.rol });
  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ mensaje: 'Error en el login', error: error.message });
  }
});

// Eliminar usuario
router.delete('/usuario/:id', async (req, res) => {
  try {
    const eliminado = await Usuario.findByIdAndDelete(req.params.id);
    if (!eliminado) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.status(200).json({ mensaje: 'Usuario eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar usuario:', err);
    res.status(500).json({ mensaje: 'Error al eliminar usuario', error: err.message });
  }
});

module.exports = router;
