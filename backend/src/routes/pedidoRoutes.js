const express = require('express');
const pedidoController = require('../controllers/pedidoController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Crear pedido (descuenta inventario automáticamente)
router.post('/', auth, pedidoController.crearPedido);

// Listar pedidos (filtros: q, estado, paginación)
router.get('/', auth, pedidoController.listarPedidos);

// Detalle
router.get('/:id', auth, pedidoController.getPedido);

// Actualizar estado y/o fechaEntrega
router.patch('/:id', auth, pedidoController.actualizarPedido);

// Registrar un pago parcial/total
router.post('/:id/pagos', auth, pedidoController.registrarPago);

// Marcar como entregado (ya tenías esta idea)
router.put('/:id/entregar', auth, pedidoController.entregarPedido);

// Cancelar pedido (restaura stock si aplica)
router.delete('/:id', auth, pedidoController.cancelarPedido);

module.exports = router;
