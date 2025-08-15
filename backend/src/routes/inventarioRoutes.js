const express = require('express');
const inventarioController = require('../controllers/inventarioController');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, inventarioController.createProducto);
router.get('/', auth, inventarioController.getProductos);
router.put('/:id', auth, inventarioController.updateProducto);
router.delete('/:id', auth, inventarioController.deleteProducto);

module.exports = router;
