const express = require('express');
const productoController = require('../controllers/productoController');
const { auth } = require('../middlewares/auth');

const router = express.Router();

router.post('/', auth, productoController.createProducto);
router.get('/', auth, productoController.getProductos);
router.put('/:id', auth, productoController.updateProducto);
router.delete('/:id', auth, productoController.deleteProducto);

module.exports = router;
