const express = require('express');
const router = express.Router();
const inventarioController = require('../controllers/inventarioController');

// Rutas para inventario
router.post('/producto', inventarioController.createProducto);
router.get('/productos', inventarioController.getProductos);
router.put('/producto/:id', inventarioController.updateProducto);
router.delete('/producto/:id', inventarioController.deleteProducto);

module.exports = router;
