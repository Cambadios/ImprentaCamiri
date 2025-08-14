const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');  // Importa el controlador

// Usamos el controlador para definir las rutas
router.use(authController);  // Esto hace que las rutas de authController sean accesibles

module.exports = router;
