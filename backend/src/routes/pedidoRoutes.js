// src/routes/pedidoRoutes.js  (o src/routes/pedidos.js, ver nota abajo)
const express = require('express');
const pedidoController = require('../controllers/pedidoController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/kpis', auth, pedidoController.kpisPedidos);
router.post('/', auth, pedidoController.crearPedido);
router.get('/', auth, pedidoController.listarPedidos);
router.get('/:id', auth, pedidoController.getPedido);

// ✅ acepta PATCH y PUT
router.patch('/:id', auth, pedidoController.actualizarPedido);
router.put('/:id', auth, pedidoController.actualizarPedido);

router.post('/:id/pagos', auth, pedidoController.registrarPago);
router.put('/:id/entregar', auth, pedidoController.entregarPedido);
router.delete('/:id', auth, pedidoController.eliminarPedido);

module.exports = router;
