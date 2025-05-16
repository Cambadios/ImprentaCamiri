const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Usuario = require('../models/usuario'); // Ajusta la ruta según tu proyecto

// Obtener todos los usuarios
router.get('/usuario', async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener usuarios', error });
  }
});

// Crear usuario con contraseña hasheada y rol
router.post('/usuario', async (req, res) => {
  try {
    const { nombre, contraseña, rol } = req.body;

    const hashedPassword = await bcrypt.hash(contraseña, 10);

    const nuevoUsuario = new Usuario({
      nombre,
      contraseña: hashedPassword,
      rol: rol || 'usuario_normal'  // si no envían rol, se usa 'usuario_normal'
    });

    await nuevoUsuario.save();
    res.status(201).json(nuevoUsuario);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al crear usuario', error });
  }
});

// Login que valida usuario y devuelve rol
router.post('/login', async (req, res) => {
  try {
    const { nombre, contraseña } = req.body;

    const usuario = await Usuario.findOne({ nombre });
    if (!usuario) return res.status(401).json({ mensaje: 'Usuario no encontrado' });

    const match = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!match) return res.status(401).json({ mensaje: 'Contraseña incorrecta' });

    // Verifica que la respuesta se envíe correctamente en formato JSON
    const response = { mensaje: "Login exitoso", nombre: usuario.nombre, rol: usuario.rol };
    console.log("Respuesta del backend:", response);  // Imprime la respuesta antes de enviarla

    // Enviar la respuesta como JSON
    res.json(response);  // Asegúrate de usar res.json() para enviar un objeto JSON
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el login', error });
  }
});
module.exports = router;
//UNIR CON AUTHROUTES SI FALLA ALGO JIJI