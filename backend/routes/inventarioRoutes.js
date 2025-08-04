const express = require('express');
const router = express.Router();
const inventarioController = require('../controllers/inventarioController');

router.post('/', inventarioController.createProducto);
router.get('/', inventarioController.getProductos);
router.put('/:id', inventarioController.updateProducto);
router.delete('/:id', inventarioController.deleteProducto);

module.exports = router;
