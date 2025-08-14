const express = require('express');
const UsuarioController = require('../controllers/usuarioController');
const Usuario = require('../models/usuario');
const { auth, requireRole } = require('../middlewares/auth');

const router = express.Router();

// Solo admin
router.get('/', auth, requireRole('admin'), UsuarioController.obtenerUsuarios);

router.get('/:id', auth, requireRole('admin'), async (req, res, next) => {
  try {
    const usuario = await Usuario.findById(req.params.id).select('-contrasena').lean();
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.json(usuario);
  } catch (e) { next(e); }
});

router.post('/', auth, requireRole('admin'), UsuarioController.crearUsuario);
router.put('/:id', auth, requireRole('admin'), UsuarioController.actualizarUsuario);
router.delete('/:id', auth, requireRole('admin'), UsuarioController.eliminarUsuario);

// ⚠️ NO login aquí (ya existe en authRoutes: POST /api/usuarios/login)

// Recuperación (pueden ser públicos si quieres)
router.post('/olvide-contrasena', UsuarioController.enviarTokenRecuperacion);
router.post('/restablecer-contrasena/:token', UsuarioController.restablecerContrasena);

// Cambio de contraseña dentro de la app (requiere estar autenticado idealmente)
router.post('/cambiar-contrasena', auth, UsuarioController.cambiarContrasena);

module.exports = router;
