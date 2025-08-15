const express = require('express');
const pedidoController = require('../controllers/pedidoController');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Ruta para entregar un pedido
router.put('/:id/entregar', auth, pedidoController.entregarPedido);

module.exports = router;
