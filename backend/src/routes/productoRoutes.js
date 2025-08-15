const express = require('express');
const productoController = require('../controllers/productoController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Crear un nuevo producto
router.post('/', auth, productoController.createProducto);

// Obtener todos los productos
router.get('/', auth, productoController.getProductos);

// Actualizar un producto
router.put('/:id', auth, productoController.updateProducto);

// Eliminar un producto
router.delete('/:id', auth, productoController.deleteProducto);

module.exports = router;
