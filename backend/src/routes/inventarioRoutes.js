// routes/inventario.js
const express = require('express');
const inventarioController = require('../controllers/inventarioController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, inventarioController.createProducto);
router.get('/', auth, inventarioController.getProductos);
router.get('/:id', auth, inventarioController.getProductoById);
router.get('/codigo/:codigo', auth, inventarioController.buscarPorCodigo);
router.put('/:id', auth, inventarioController.updateProducto);
router.delete('/:id', auth, inventarioController.deleteProducto);

module.exports = router;
