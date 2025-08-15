const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');  // Importa el controlador

// Definición de rutas específicas para login y register
router.post('/login', authController.login);  // Ruta para el login
router.post('/register', authController.register);  // Ruta para el registro

module.exports = router;
