const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const ctrl = require('../controllers/exportController');

// Cada endpoint devuelve application/pdf con attachment
router.get('/clientes.pdf',   auth, ctrl.exportClientes);
router.get('/inventario.pdf', auth, ctrl.exportInventario); // admite ?q=...
router.get('/pedidos.pdf',    auth, ctrl.exportPedidos);    // admite ?q=&estado=
router.get('/productos.pdf',  auth, ctrl.exportProductos);
router.get('/usuarios.pdf',   auth, ctrl.exportUsuarios);
router.get('/categorias.pdf',  ctrl.exportCategorias);


module.exports = router;
