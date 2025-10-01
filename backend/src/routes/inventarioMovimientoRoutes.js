// routes/inventarioMovimientos.js
const express = require('express');
const { auth } = require('../middleware/auth');
const invMov = require('../controllers/inventarioMovimientoController');

const router = express.Router();

// Acciones
router.post('/ingreso', auth, invMov.crearIngreso);
router.post('/salida',  auth, invMov.crearSalida);
router.post('/agregar', auth, invMov.agregarInsumoExistente); // sumar stock a material existente

// Consultas
router.get('/',                 auth, invMov.listarMovimientos);
router.get('/kardex/:insumoId', auth, invMov.kardexPorInsumo);

module.exports = router;
