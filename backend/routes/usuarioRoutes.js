const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Usuario = require('../models/usuario'); // Ajusta ruta si es necesario

// Obtener todos los usuarios
router.get('/usuario', async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios', error });
  }
});

// Crear usuario con contraseña hasheada
router.post('/usuario', async (req, res) => {
  try {
    console.log('Request Body:', req.body);  // Para debug

    const { nombre, contraseña } = req.body;

    const hashedPassword = await bcrypt.hash(contraseña, 10);
    console.log('Hashed Password:', hashedPassword);

    const nuevoUsuario = new Usuario({
      nombre,
      contraseña: hashedPassword
    });

    await nuevoUsuario.save();
    res.status(201).json(nuevoUsuario);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear usuario', error });
  }
});

module.exports = router;
