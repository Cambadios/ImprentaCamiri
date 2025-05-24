const express = require('express');
const bcrypt = require('bcrypt');
const Usuario = require('../models/usuario'); // Asegúrate que esta ruta es correcta
const router = express.Router();

// Ruta para login
router.post('/login', async (req, res) => {
  const { correo, contraseña } = req.body;

  try {
    // Buscar usuario por correo
    const usuario = await Usuario.findOne({ correo });
    if (!usuario) {
      return res.status(400).json({ mensaje: 'Usuario no encontrado' });
    }

    // Verificar contraseña
    const coincide = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!coincide) {
      return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
    }

    // Login exitoso, responder con rol
    res.json({ mensaje: 'Login exitoso', rol: usuario.rol || 'usuario_normal' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

module.exports = router;
