const express = require('express');
const bcrypt = require('bcrypt');
const Usuario = require('../models/usuario'); // Modelo de usuario
const router = express.Router();

// Ruta para Login de usuario
router.post('/login', async (req, res) => {
  const { nombre, contraseña } = req.body;

  try {
    // Buscar el usuario por nombre
    const usuario = await Usuario.findOne({ nombre });
    if (!usuario) {
      return res.status(400).send('Usuario no encontrado');
    }

    // Comparar las contraseñas
    const coincide = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!coincide) {
      return res.status(401).send('Contraseña incorrecta');
    }

    // Si el login es exitoso
    res.send('Login exitoso');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error en el servidor');
  }
});

module.exports = router;
