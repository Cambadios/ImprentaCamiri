// routes/pedidos.js
const express = require('express');
const pedidoController = require('../controllers/pedidoController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/kpis', auth, pedidoController.kpisPedidos);
router.post('/', auth, pedidoController.crearPedido);
router.get('/', auth, pedidoController.listarPedidos);
router.get('/:id', auth, pedidoController.getPedido);
router.patch('/:id', auth, pedidoController.actualizarPedido);
router.post('/:id/pagos', auth, pedidoController.registrarPago);
router.put('/:id/entregar', auth, pedidoController.entregarPedido);

// DELETE definitivo (sin reponer si está Entregado o Cancelado)
router.delete('/:id', auth, pedidoController.eliminarPedido);

module.exports = router;
