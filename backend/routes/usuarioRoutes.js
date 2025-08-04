const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/usuarioController');
const Usuario = require('../models/usuario');

router.get('/', UsuarioController.obtenerUsuarios);
router.get('/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id).select('-contrasena');
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

router.post('/', UsuarioController.crearUsuario);
router.post('/login', UsuarioController.loginUsuario);  // ✅ nueva ruta para login
router.put('/:id', UsuarioController.actualizarUsuario);
router.delete('/:id', UsuarioController.eliminarUsuario);
router.post('/olvide-contrasena', UsuarioController.enviarTokenRecuperacion);
router.post('/restablecer-contrasena/:token', UsuarioController.restablecerContrasena);

module.exports = router;
