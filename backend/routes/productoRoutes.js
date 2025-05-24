const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');  // Asegúrate de que este archivo existe y las funciones estén exportadas

// Crear producto
router.post('/', productoController.createProducto);

// Obtener todos los productos
router.get('/', productoController.getProductos);

// Actualizar producto
router.put('/:id', productoController.updateProducto);

// Eliminar producto
router.delete('/:id', productoController.deleteProducto);  // Nueva ruta para eliminar producto

module.exports = router;
