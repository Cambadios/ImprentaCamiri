const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/categoriaController');

router.post('/', ctrl.crearCategoria);
router.get('/', ctrl.listarCategorias);
router.put('/:id', ctrl.actualizarCategoria);
router.delete('/:id', ctrl.eliminarCategoria);

module.exports = router;
